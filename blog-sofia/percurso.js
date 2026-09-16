/* Passaporte: armazenamento e fila separados por aluno. */
(function () {
  'use strict';
  const proto = Storage.prototype;
  const original = { get: proto.getItem, set: proto.setItem, remove: proto.removeItem };
  const read = k => original.get.call(localStorage, k);
  const write = (k,v) => original.set.call(localStorage,k,String(v));
  const drop = k => original.remove.call(localStorage,k);
  const parse = (s,f) => { try { return JSON.parse(s) || f; } catch { return f; } };
  const session = () => { const s=parse(read('passaporte-sessao'),null); return s && s.token && Date.parse(s.expira)>Date.now() ? s : null; };
  const owner = () => session()?.codigo || 'visitante';
  const prefix = id => 'percurso:' + id + ':';
  const queueKey = id => prefix(id)+'fila';
  const queue = id => parse(read(queueKey(id)),{});
  const isProgress = k => typeof k==='string' && k.startsWith('sofia-');
  const notify = () => window.dispatchEvent(new Event('percurso-atualizado'));
  let timer, sending=false;
  // Migração única: o cache legado vai para a sessão já aberta ou para visitante.
  // Dados de visitante não são copiados automaticamente para outro aluno.
  if (!read('percurso-migrado-v2')) {
    const id = session()?.codigo || 'visitante';
    const keys=Object.keys(localStorage).filter(isProgress);
    keys.forEach(k=>write(prefix(id)+k,read(k)));
    if (id !== 'visitante') write(queueKey(id),JSON.stringify(Object.fromEntries(keys.map(k=>[k,read(k)]))));
    write('percurso-migrado-v2','1');
  }
  proto.getItem=function(k){ return this===localStorage && isProgress(k) ? read(prefix(owner())+k) : original.get.apply(this,arguments); };
  proto.setItem=function(k,v){
    if(this!==localStorage || !isProgress(k)) return original.set.apply(this,arguments);
    const id=owner(); write(prefix(id)+k,v);
    const q=queue(id); q[k]=String(v); write(queueKey(id),JSON.stringify(q));
    clearTimeout(timer); timer=setTimeout(send,1200);
  };
  proto.removeItem=function(k){
    if(this===localStorage && isProgress(k)) throw new Error('Use o estado do item para retirá-lo; descobertas são preservadas.');
    return original.remove.apply(this,arguments);
  };
  async function send(){
    const s=session(); if(sending || !s || !navigator.onLine) return;
    const snapshot=queue(s.codigo); if(!Object.keys(snapshot).length) return;
    sending=true;
    try {
      const r=await fetch('/api/percurso',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.token},body:JSON.stringify({chaves:snapshot})});
      if(r.ok){
        const current=queue(s.codigo);
        Object.keys(snapshot).forEach(k=>{if(current[k]===snapshot[k]) delete current[k];});
        write(queueKey(s.codigo),JSON.stringify(current));
      }
    } catch {} finally { sending=false; }
  }
  async function receive(){
    const s=session(); if(!s) return false;
    try{
      const r=await fetch('/api/percurso',{headers:{Authorization:'Bearer '+s.token}});
      if(!r.ok) return false;
      const data=await r.json();
      if(session()?.token!==s.token) return false;
      const pending=queue(s.codigo);
      Object.entries(data.chaves||{}).forEach(([k,v])=>{if(isProgress(k) && !(k in pending)) write(prefix(s.codigo)+k,v);});
      notify(); await send(); return true;
    }catch{return false;}
  }
  window.Percurso={
    aberto:()=>!!session(), codigo:()=>session()?.codigo,
    /* Só para a interface saber o que mostrar. Não vale como permissão:
       quem autoriza é o servidor, a cada pedido. */
    papel:()=>session()?.papel||'aluno',
    async abrir(codigo,pin){
      const r=await fetch('/api/entrar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo,pin})});
      const data=await r.json(); if(!r.ok) throw Object.assign(new Error(data.erro),{status:r.status});
      write('passaporte-sessao',JSON.stringify(data));
      await receive(); notify(); return data;
    },
    fechar(){drop('passaporte-sessao');notify();},
    sincronizar:receive,
    async requisitar(path,options={}){
      const s=session(); if(!s) throw new Error('Abra seu passaporte para continuar.');
      const r=await fetch('/api/'+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.token,...options.headers}});
      const data=await r.json();
      if(session()?.token!==s.token) throw new Error('O passaporte mudou. Reabra a Sala.');
      if(!r.ok) throw Object.assign(new Error(data.erro||'Não foi possível salvar.'),{status:r.status});
      return data;
    }
  };
  window.addEventListener('online',()=>{receive();send();});
  window.addEventListener('storage',notify);
  setInterval(send,5000);
  window.Percurso.pronto=receive();

  /* A porta para a Sala.
   *
   * Ela fica escondida em quase toda pagina e so aparece depois que a Sala
   * foi destrancada, no arco II. Antes disso seria uma porta que nao abre —
   * e uma porta que nao abre ensina o aluno a parar de tentar.
   *
   * Quem marca a porta e o data-sala-porta no HTML; quem decide e o
   * progresso. Por isso espera o receive(): num aparelho novo, a chave ainda
   * esta no servidor quando a pagina termina de carregar.
   *
   * Le pelo localStorage remendado acima, nao pelo read() cru: as chaves de
   * progresso ficam guardadas com o codigo do aluno na frente, e so o getItem
   * remendado sabe montar esse nome. Ler cru devolve sempre vazio. */
  const abrirPortas=()=>{
    if(!localStorage.getItem('sofia-room-unlocked'))return;
    document.querySelectorAll('[data-sala-porta]').forEach(n=>{n.hidden=false;});
  };
  window.Percurso.pronto.then(abrirPortas,abrirPortas);
  window.addEventListener('percurso-atualizado',abrirPortas);
  window.addEventListener('storage',abrirPortas);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',abrirPortas);
})();
