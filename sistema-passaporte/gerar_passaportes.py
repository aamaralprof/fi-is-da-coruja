# -*- coding: utf-8 -*-
"""Gera passaportes para uma turma.

Produz duas coisas, e a diferença entre elas é o coração do sistema:

  saida/passaportes.sql          vai para o banco. Só códigos e PINs cifrados.
  saida/lista-para-imprimir.html fica com a professora. Códigos e PINs legíveis.

O banco nunca sabe de quem é cada código. Quem sabe é o papel, e o papel é seu.
Imprima, recorte, entregue, guarde a sua via. Se essa lista se perder, ninguém
mais no mundo consegue dizer a quem pertence o passaporte CORUJA-7K4M.

Uso:
    python gerar_passaportes.py 32
    python gerar_passaportes.py 32 --turma "7º B"
"""

import argparse
import base64
import hashlib
import html
import os
import secrets

# Sem I, L, O, 0 e 1: à mão, num papel recortado, essas letras viram outras.
ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
ITERACOES = 100000  # precisa ser igual ao da API
SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saida")


def base64url(dados: bytes) -> str:
    return base64.urlsafe_b64encode(dados).decode().rstrip("=")


def novo_codigo() -> str:
    return "CORUJA-" + "".join(secrets.choice(ALFABETO) for _ in range(4))


def novo_pin() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(4))


def cifrar(pin: str, sal: bytes) -> str:
    return base64url(hashlib.pbkdf2_hmac("sha256", pin.encode(), sal, ITERACOES, dklen=32))


def gerar(quantidade: int):
    passaportes, vistos = [], set()
    while len(passaportes) < quantidade:
        codigo = novo_codigo()
        if codigo in vistos:
            continue
        vistos.add(codigo)
        pin = novo_pin()
        sal = secrets.token_bytes(16)
        passaportes.append({
            "codigo": codigo,
            "pin": pin,
            "sal": base64url(sal),
            "hash": cifrar(pin, sal),
        })
    return passaportes


def escrever_sql(passaportes, caminho):
    linhas = [
        "-- Passaportes gerados. Nenhum PIN legível aqui dentro.",
        "-- Importar com: wrangler d1 execute NOME_DO_BANCO --remote --file=passaportes.sql",
        "",
    ]
    for p in passaportes:
        linhas.append(
            "INSERT INTO passaportes (codigo, pin_hash, pin_sal, criado_em) "
            "VALUES ('{codigo}', '{hash}', '{sal}', datetime('now')) "
            "ON CONFLICT(codigo) DO NOTHING;".format(**p)
        )
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")


def escrever_lista(passaportes, caminho, turma):
    cartoes = "".join(
        "<article><p class=\"rotulo\">PASSAPORTE DO ALUNO</p>"
        "<p class=\"codigo\">{codigo}</p>"
        "<p class=\"pin\">PIN <strong>{pin}</strong></p>"
        "<p class=\"nome\">nome: ______________________</p></article>".format(
            codigo=html.escape(p["codigo"]), pin=html.escape(p["pin"])
        )
        for p in passaportes
    )
    titulo = "Passaportes" + (" — " + html.escape(turma) if turma else "")
    pagina = """<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>{titulo}</title><style>
*{{box-sizing:border-box}}
body{{margin:0;padding:14mm;color:#241f1a;font-family:Georgia,"Times New Roman",serif;background:#fff}}
h1{{margin:0 0 2mm;font-size:15pt}}
.aviso{{margin:0 0 7mm;padding:3mm 4mm;font-size:8.5pt;line-height:1.5;background:#f6f1e4;border-left:3px solid #b3922f}}
.grade{{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}}
article{{padding:5mm;border:1px dashed #9a8f7a;border-radius:2mm;break-inside:avoid}}
.rotulo{{margin:0 0 2mm;color:#8a7c5e;font-size:6.5pt;letter-spacing:.14em}}
.codigo{{margin:0;font-size:15pt;font-weight:bold;letter-spacing:.06em}}
.pin{{margin:2mm 0 0;font-size:10pt}}
.pin strong{{font-size:14pt;letter-spacing:.22em}}
.nome{{margin:4mm 0 0;color:#6d6455;font-size:8pt}}
@media print{{.aviso{{background:none}}}}
</style></head><body>
<h1>{titulo}</h1>
<p class="aviso"><strong>Esta folha é a única ligação entre um código e um aluno.</strong>
O banco de dados guarda apenas o código e o PIN cifrado — não sabe, e não tem como
descobrir, de quem é cada passaporte. Escreva o nome de cada aluno ao lado do código
antes de recortar, e guarde esta via. Se ela se perder, o vínculo se perde junto.</p>
<div class="grade">{cartoes}</div>
</body></html>""".format(titulo=titulo, cartoes=cartoes)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(pagina)


def main():
    parser = argparse.ArgumentParser(description="Gera passaportes para uma turma.")
    parser.add_argument("quantidade", type=int, help="quantos passaportes gerar")
    parser.add_argument("--turma", default="", help="rótulo impresso na folha; nunca vai ao banco")
    argumentos = parser.parse_args()

    if argumentos.quantidade < 1 or argumentos.quantidade > 500:
        parser.error("escolha entre 1 e 500 passaportes")

    os.makedirs(SAIDA, exist_ok=True)
    passaportes = gerar(argumentos.quantidade)

    caminho_sql = os.path.join(SAIDA, "passaportes.sql")
    caminho_lista = os.path.join(SAIDA, "lista-para-imprimir.html")
    escrever_sql(passaportes, caminho_sql)
    escrever_lista(passaportes, caminho_lista, argumentos.turma)

    print("{} passaportes gerados.".format(len(passaportes)))
    print("  banco:    {}".format(caminho_sql))
    print("  imprimir: {}".format(caminho_lista))
    print("")
    print("A lista impressa contem os PINs legiveis. Ela nao entra no repositorio.")


if __name__ == "__main__":
    main()
