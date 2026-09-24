/* Catálogo: os itens referenciam os desbloqueios existentes. */
window.Investigacao = {
  casos: {
    heliopolis: {nome:'Heliópolis', pergunta:'Que vestígios ficaram do que aconteceu na Sala 17?', post:'post-a-janela-nao-dava-para-o-patio.html', chave:'sofia-room-unlocked'},
    tales: {nome:'O fragmento · Mileto', pergunta:'Que conexão existe entre o fragmento, Mileto e a água?', post:'post-choveu-no-meu-caderno.html', chave:'sofia-mission-fragmento-desconhecido'},
    percurso: {nome:'Como vim parar aqui?', pergunta:'O que a cronologia esclarece — e o que continua sendo hipótese?', post:'post-como-foi-que-eu-vim-parar-aqui.html', chave:'sofia-clue-anotacoes-organizadas'},
    universo: {nome:'A pergunta maior', pergunta:'O que este universo representa?', chave:'sofia-room-unlocked'}
  },
  itens: [
    {id:'owl-mark',titulo:'A marca no chão',tipo:'pista',chave:'sofia-clue-owl-mark',texto:'Uma marca encontrada no caminho de Sofia.'},
    {id:'unknown-writing',titulo:'A frase no caderno',tipo:'pista',chave:'sofia-clue-unknown-writing',texto:'Uma escrita que Sofia não reconheceu.'},
    {id:'corridor-teacher',titulo:'A professora no corredor',tipo:'pista',chave:'sofia-clue-corridor-teacher',texto:'Uma presença nos espaços de passagem.'},
    {id:'broken-message',titulo:'A mensagem sem origem',tipo:'pista',chave:'sofia-clue-broken-message',texto:'Uma mensagem cuja origem permanece desconhecida.'},
    {id:'mirna-knows',titulo:'Mirna sabia da linha',tipo:'pista',chave:'sofia-clue-mirna-knows',texto:'Mirna parecia saber mais do que dizia.'},
    {id:'after-signal',titulo:'Depois do último sinal',tipo:'pista',chave:'sofia-clue-after-signal',texto:'O horário só apareceu quando já era tarde para ser um horário.'},
    {id:'impossible-bookmark',titulo:'O marcador impossível',tipo:'pista',chave:'sofia-clue-impossible-bookmark',texto:'Ele estava dentro de um livro que Sofia ainda não tinha aberto.'},
    {id:'linked-uniforms',titulo:'Dois uniformes, uma costura',tipo:'pista',chave:'sofia-clue-linked-uniforms',texto:'Os dois uniformes mudam como versões da mesma coisa.'},
    {id:'test-recognized-sofia',titulo:'O teste reconheceu Sofia',tipo:'pista',chave:'sofia-clue-test-recognized-sofia',texto:'Por um instante, o resultado deixou de ser um Caminho.'},
    {id:'fieis-da-coruja',titulo:'Fiéis da Coruja',tipo:'emblema',chave:'sofia-emblem-fieis-da-coruja',imagem:'assets/fieis-da-coruja-inventario.png',texto:'Origem ainda não identificada.'},
    {id:'ordem-do-eclipse',titulo:'Ordem do Eclipse',tipo:'emblema',chave:'sofia-emblem-ordem-do-eclipse',imagem:'assets/ordem-do-eclipse-inventario.png',texto:'Encontrado numa perspectiva que Sofia não viu.'},
    {id:'mission-system',titulo:'Consulta interrompida',tipo:'objeto',chave:'sofia-mission-system',imagem:'assets/escritorio-do-destino-inventario.png',texto:'Origem: Sistema do Destino.'},
    {id:'mission-poseidon',titulo:'Reserva sem destino',tipo:'objeto',chave:'sofia-mission-poseidon',imagem:'assets/poseidon-lines-inventario.png',texto:'Operadora: Poseidon Lines.'},
    {id:'mission-passport',titulo:'Passaporte de percurso',tipo:'objeto',chave:'sofia-mission-passport',imagem:'assets/passaporte-frente.png',texto:'Titular reconhecida: Sofia.'},
    {id:'fragmento-carta',titulo:'Carta do Escritório do Destino',tipo:'documento',chave:'sofia-clue-heliopolis-letter',caso:'heliopolis',imagem:'assets/arco2/carta-de-heliopolis.png',texto:'“Viajante, antes de Mileto levantar sua voz filosófica [...] os sacerdotes de Heliópolis já conversavam com o sol.”',fonte:'Fragmento iluminado · Sala 17'},
    {id:'escritorio-destino',titulo:'Escritório do Destino',tipo:'emblema',chave:'sofia-emblem-escritorio-do-destino',caso:'heliopolis',imagem:'assets/escritorio-do-destino-inventario.png',texto:'Origem: desconhecida. Vínculo: desconhecido.'},
    {id:'estatueta-egito',imagem:'assets/arco2/estatueta.webp',titulo:'Lembrança do Egito',tipo:'decoracao',chave:'sofia-decoration-egito',caso:'heliopolis',texto:'Encontrada na missão opcional de Heliópolis.'},
    {id:'postal-arche',titulo:'Postal endereçado a Sofia',tipo:'objeto',chave:'sofia-mission-postal-arche',caso:'heliopolis',imagem:'assets/arco2/postal-arche-sofia.jpeg',texto:'Qual é o princípio de todas as coisas? O que é o archê?'},
    {id:'primeiro-reflexo',titulo:'O Primeiro Reflexo',tipo:'emblema',chave:'sofia-emblem-first-reflection',caso:'heliopolis',imagem:'assets/escritorio-do-destino-inventario.png',texto:'Conquistado ao observar o que existia entre duas paisagens.'},
    {id:'fragmento-desconhecido-post2',titulo:'Fragmento desconhecido',tipo:'objeto',chave:'sofia-mission-fragmento-desconhecido',caso:'tales',imagem:'assets/arco2/fragmento-desconhecido.png',texto:'Um fragmento apareceu no caderno de Sofia durante a aula de Ciências.'},
    {id:'mileto-post2',titulo:'Mileto',tipo:'pista',chave:'sofia-clue-mileto-post2',caso:'tales',texto:'O fragmento parece estar ligado a um pensador da antiga cidade de Mileto. A presença recorrente da água pode ser importante.'},
    {id:'convite-fieis',titulo:'Convite dos Fiéis da Coruja',tipo:'documento',chave:'sofia-document-convite-fieis',caso:'tales',imagem:'assets/arco2/convite-fieis-original.jpeg',texto:'Convite formal para um círculo reservado daqueles que ousam atravessar as fronteiras do tempo e do pensamento.'},
    /* registros: mesmos seis textos de research[].record em post4.js. O
       examinador mostra só os que o próprio aluno liberou (ver D.ler em
       sala.js) — sem isso, a Sala prometia pesquisas que ele nunca abriu. */
    {id:'anotacoes-organizadas',titulo:'Minhas anotações (finalmente organizadas)',tipo:'documento',chave:'sofia-clue-anotacoes-organizadas',caso:'percurso',imagem:'assets/arco2/post4/caderno-aberto.png',texto:'Linha do tempo, mapa, nomes, símbolos, hipóteses e perguntas reunidos por Sofia. Não confundir pistas com respostas.',fonte:'Caderno da Sofia · anotação 04',registros:[
      {chave:'sofia-post4-research-carta',texto:'ATENAS → qual é a relação com a mulher?'},
      {chave:'sofia-post4-research-sisifo',texto:'SÍSIFO — por que esse nome?'},
      {chave:'sofia-post4-research-coruja',texto:'CORUJA → ATENA?'},
      {chave:'sofia-post4-research-mulheres',texto:'TRÊS MULHERES → MOIRAS?'},
      {chave:'sofia-post4-research-cores',texto:'MENINO + MANTO → MESMAS CORES?'},
      {chave:'sofia-post4-research-lugares',texto:'POR QUE COMEÇARAM POR ESSES DOIS LUGARES?'}
    ]}
  ],
  /* Por onde o catálogo lê o progresso. A Sala em modo leitura troca esta
     função pelo percurso do aluno que está sendo visitado, para que a
     professora veja as descobertas dele e não as dela. */
  ler(chave){return localStorage.getItem(chave);},
  disponivel(item){return ['found','collected','unlocked','true'].includes(this.ler(item.chave));},
  desbloquear(id){ const item=this.itens.find(i=>i.id===id); if(item) localStorage.setItem(item.chave,item.tipo==='emblema'?'collected':'found'); },
  origem(item){return item.tipo==='emblema'?'Coleção de Emblemas':item.tipo==='objeto'?'Inventário da Missão':item.tipo==='decoracao'?'Decoração':'Caderno de Pistas';}
};
