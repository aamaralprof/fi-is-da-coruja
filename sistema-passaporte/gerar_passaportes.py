# -*- coding: utf-8 -*-
"""Gera passaportes para uma turma.

Produz duas coisas, e a diferença entre elas é o coração do sistema:

  saida/passaportes.sql   vai para o banco. Só códigos e PINs cifrados.
  saida/etiquetas.html    fica com a professora. Nomes, códigos e PINs legíveis.

O nome do aluno aparece na etiqueta e em nenhum outro lugar. Ele não entra no
SQL, não vai para a Cloudflare, não sai deste computador. O banco continua
sabendo apenas que CORUJA-7K4M leu o capítulo 4 — nunca quem é.

Uso:
    python gerar_passaportes.py --nomes turma.txt --turma "7º B"
    python gerar_passaportes.py 32 --turma "7º B"     (sem nomes)
"""

import argparse
import base64
import hashlib
import html
import io
import os
import secrets

# Sem I, L, O, 0 e 1: à mão, num papel recortado, essas letras viram outras.
ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
ITERACOES = 100000  # precisa ser igual ao do worker.js
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "saida")
SELO = os.path.join(AQUI, "..", "blog-sofia", "assets", "escritorio-do-destino-inventario.png")


def base64url(dados: bytes) -> str:
    return base64.urlsafe_b64encode(dados).decode().rstrip("=")


def novo_codigo() -> str:
    return "CORUJA-" + "".join(secrets.choice(ALFABETO) for _ in range(4))


def novo_pin() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(4))


def cifrar(pin: str, sal: bytes) -> str:
    return base64url(hashlib.pbkdf2_hmac("sha256", pin.encode(), sal, ITERACOES, dklen=32))


def ler_nomes(caminho: str):
    if not os.path.isabs(caminho):
        caminho = os.path.join(AQUI, caminho)
    with io.open(caminho, encoding="utf-8") as f:
        return [linha.strip() for linha in f
                if linha.strip() and not linha.lstrip().startswith("#")]


def selo_embutido() -> str:
    """O selo entra dentro do arquivo, não como link.

    Assim a folha de etiquetas pode ser movida, copiada ou aberta em outro
    computador sem perder a estampa.
    """
    try:
        from PIL import Image
        with Image.open(SELO) as im:
            im = im.convert("RGBA")
            im.thumbnail((190, 190), Image.LANCZOS)
            buffer = io.BytesIO()
            im.save(buffer, format="PNG", optimize=True)
            bruto = buffer.getvalue()
    except Exception:
        try:
            with open(SELO, "rb") as f:
                bruto = f.read()
        except Exception:
            return ""
    return "data:image/png;base64," + base64.b64encode(bruto).decode()


def gerar(nomes):
    passaportes, vistos = [], set()
    for nome in nomes:
        codigo = novo_codigo()
        while codigo in vistos:
            codigo = novo_codigo()
        vistos.add(codigo)
        pin = novo_pin()
        sal = secrets.token_bytes(16)
        passaportes.append({
            "nome": nome,
            "codigo": codigo,
            "pin": pin,
            "sal": base64url(sal),
            "hash": cifrar(pin, sal),
        })
    return passaportes


def escrever_sql(passaportes, caminho):
    linhas = [
        "-- Passaportes gerados. Nenhum PIN legível e nenhum nome aqui dentro.",
        "-- Cole no Console do banco D1, no painel da Cloudflare.",
        "",
    ]
    for p in passaportes:
        linhas.append(
            "INSERT INTO passaportes (codigo, pin_hash, pin_sal, criado_em) "
            "VALUES ('{codigo}', '{hash}', '{sal}', datetime('now')) "
            "ON CONFLICT(codigo) DO NOTHING;".format(**p)
        )
    with io.open(caminho, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")


ETIQUETA = """<article class="etiqueta">
  <div class="selo">{selo}</div>
  <p class="emissor">EMITIDO PELO ESCRITÓRIO DO DESTINO</p>
  <p class="nome">{nome}</p>
  <div class="credenciais">
    <span><small>CÓDIGO</small><strong>{codigo}</strong></span>
    <span><small>PIN</small><strong class="pin">{pin}</strong></span>
  </div>
  <p class="rodape">nem toda passagem aparece no mapa</p>
</article>"""


def escrever_etiquetas(passaportes, caminho, turma):
    selo = selo_embutido()
    marca = '<img src="{}" alt="">'.format(selo) if selo else "&#9670;"

    corpo = "".join(
        ETIQUETA.format(
            selo=marca,
            nome=html.escape(p["nome"]) or "&nbsp;",
            codigo=html.escape(p["codigo"]),
            pin=html.escape(p["pin"]),
        )
        for p in passaportes
    )

    titulo = "Passaportes" + (" — " + html.escape(turma) if turma else "")
    pagina = u"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;700&display=swap">
<style>
*{{box-sizing:border-box}}
body{{margin:0;padding:10mm;color:#2b2419;background:#fff;font-family:"DM Sans",system-ui,sans-serif}}
h1{{margin:0 0 3mm;font-family:"Cormorant Garamond",Georgia,serif;font-size:17pt;font-weight:600}}
.aviso{{max-width:190mm;margin:0 0 8mm;padding:4mm 5mm;font-size:8.5pt;line-height:1.55;
  background:#faf6ec;border-left:3px solid #b3922f}}
.folha{{display:grid;grid-template-columns:repeat(2,1fr);gap:4mm}}
.etiqueta{{position:relative;display:flex;flex-direction:column;align-items:center;
  padding:6mm 5mm 5mm;text-align:center;break-inside:avoid;
  background:#fdfaf2;border:1px dashed #a8977a;border-radius:1.5mm}}
.selo{{height:15mm;margin-bottom:1.5mm}}
.selo img{{height:15mm;width:auto;display:block}}
.emissor{{margin:0 0 2.5mm;color:#8a7442;font-size:5.6pt;font-weight:700;letter-spacing:.13em}}
.nome{{margin:0 0 3.5mm;padding-bottom:2.5mm;width:100%;
  font-family:"Cormorant Garamond",Georgia,serif;font-size:14.5pt;line-height:1.15;
  border-bottom:1px solid #d9cdb2}}
.credenciais{{display:flex;justify-content:center;gap:8mm;width:100%}}
.credenciais span{{display:flex;flex-direction:column;gap:.8mm}}
.credenciais small{{color:#96876a;font-size:5.6pt;font-weight:700;letter-spacing:.13em}}
.credenciais strong{{font-size:12pt;letter-spacing:.05em}}
.pin{{letter-spacing:.3em}}
.rodape{{margin:3.5mm 0 0;color:#a2937a;font-size:6pt;font-style:italic}}
@media print{{
  body{{padding:8mm}}
  .aviso{{background:none;border-left-color:#999}}
  .etiqueta{{background:none}}
}}
</style></head><body>
<h1>{titulo}</h1>
<p class="aviso"><strong>Esta folha é a única ligação entre um código e um aluno.</strong>
O banco de dados guarda apenas o código e o PIN cifrado — o nome não sai daqui.
Confira os nomes, recorte e entregue. <strong>Guarde uma via.</strong> Se ela se
perder, ninguém mais consegue dizer de quem é cada passaporte.</p>
<div class="folha">{corpo}</div>
</body></html>""".format(titulo=titulo, corpo=corpo)

    with io.open(caminho, "w", encoding="utf-8") as f:
        f.write(pagina)


def main():
    parser = argparse.ArgumentParser(description="Gera passaportes para uma turma.")
    parser.add_argument("quantidade", nargs="?", type=int, default=None,
                        help="quantos passaportes gerar, quando não houver lista de nomes")
    parser.add_argument("--nomes", default=None,
                        help="arquivo com um nome por linha; os nomes só vão para a etiqueta")
    parser.add_argument("--turma", default="", help="rótulo impresso na folha; nunca vai ao banco")
    argumentos = parser.parse_args()

    if argumentos.nomes:
        nomes = ler_nomes(argumentos.nomes)
        if not nomes:
            parser.error("a lista de nomes está vazia")
    elif argumentos.quantidade:
        if argumentos.quantidade < 1 or argumentos.quantidade > 500:
            parser.error("escolha entre 1 e 500 passaportes")
        nomes = [""] * argumentos.quantidade
    else:
        parser.error("informe uma quantidade ou um arquivo com --nomes")

    os.makedirs(SAIDA, exist_ok=True)
    passaportes = gerar(nomes)

    caminho_sql = os.path.join(SAIDA, "passaportes.sql")
    caminho_etiquetas = os.path.join(SAIDA, "etiquetas.html")
    escrever_sql(passaportes, caminho_sql)
    escrever_etiquetas(passaportes, caminho_etiquetas, argumentos.turma)

    print("{} passaportes gerados.".format(len(passaportes)))
    print("  etiquetas: {}".format(caminho_etiquetas))
    print("  banco:     {}".format(caminho_sql))
    print("")
    print("As etiquetas trazem nome, codigo e PIN legiveis.")
    print("Elas nao entram no repositorio nem no banco de dados.")


if __name__ == "__main__":
    main()
