# Cyclelife - Documentacao do Projeto

Ultima atualizacao: 2026-08-07

## Regra de trabalho daqui em diante

Este documento e a referencia viva do projeto. A cada nova build ou alteracao relevante, atualizar esta documentacao junto com o codigo.

Em toda entrega de build, responder ao usuario com:

- Link local para jogar a versao atual.
- Link do repositorio GitHub quando houver push.
- Commit gerado, quando houver commit.
- Resumo objetivo do que foi feito.
- Validacoes executadas.
- Observacoes de gameplay, riscos ou proximos ajustes.

## Visao geral

Cyclelife e um jogo de plataforma 2D em pixel art, simples e dificil, feito para matar o jogador por meio do proprio cenario.

O jogador possui apenas uma vida. Ao morrer, ele retorna ao inicio da fase ou ao ultimo checkpoint valido. O objetivo de cada fase e chegar ate uma porta. A dificuldade vem de armadilhas que parecem parte normal do mapa, mas reagem ao jogador: nuvens do cenario caem, serras aparecem, espinhos sobem de buracos, checkpoints podem enganar, uma bomba gigante explode repetidamente e uma tesoura gigante persegue o jogador na fase final.

## Pilares de design

- Dificuldade injusta, mas aprendivel.
- Cenario como principal inimigo.
- Morte rapida e retorno rapido.
- Pouca interface, foco na leitura da fase.
- Visual pixel art simples, com jogador quadrado.
- Cada armadilha deve ensinar algo ao jogador depois da primeira morte.

## Estado atual do jogo

O projeto e um jogo estatico em HTML, CSS e JavaScript puro. Ele roda direto no navegador abrindo `index.html`, sem build step e sem dependencias externas.

Arquivos principais:

- `index.html`: estrutura da pagina, canvas, HUD e controles de toque.
- `style.css`: moldura visual, responsividade, estilo pixel art e botoes mobile.
- `game.js`: loop principal, fisica, colisao, camera, fases, armadilhas, checkpoints, FX e renderizacao.
- `assets/silver-feather-logo.png`: logo usado na tela inicial de loading.
- `assets/world_tileset.png`: tileset usado para chao/grama e neve.
- `assets/platforms.png`: sprite usado nas plataformas moveis da fase 5.
- `README.md`: resumo publico do projeto.
- `docs/PROJECT_DOCUMENTATION.md`: documentacao completa e parametro de trabalho.

## Loop e velocidade

O jogo usa `requestAnimationFrame`, mas a fisica e os movimentos principais sao normalizados por tempo.

Comportamento atual:

- A referencia de gameplay e 60 FPS (`FRAME_MS = 1000 / 60`).
- Movimento do jogador, gravidade, aceleracao, atrito, nuvens-armadilha, bomba e tesoura usam `step = dt / FRAME_MS`.
- Isso evita que navegadores ou monitores em 120 Hz/144 Hz acelerem o jogo.
- Temporizadores como espinhos ciclicos, contagem da bomba e tempo final continuam baseados em milissegundos reais.

## Loading e menu do jogo

Antes do menu, o jogo exibe uma tela de loading de 3 segundos com o logo `Silver Feather Studio`.

Comportamento atual:

- A tela de loading e renderizada no canvas antes de aceitar entrada de menu.
- O logo usa o asset enviado pelo usuario e copiado para `assets/silver-feather-logo.png`.
- Ha uma barra simples de progresso visual.
- Ao fim de 3 segundos, o jogo entra automaticamente no menu.

O jogo abre em um menu animado renderizado no canvas.

Elementos atuais:

- Titulo `CYCLELIFE`.
- Fundo com nuvens animadas e chao pixel art.
- Cena animada no chao verde existente do menu, em segundo plano, com o jogador correndo de uma marreta gigante.
- A marreta nunca acerta o jogador nessa animacao; ela apenas reforca o tom do jogo.
- Botao `Jogar`, que inicia a fase 1.
- Botao `Volume`, que alterna entre `100%`, `50%` e `0%`.
- Botao `Sair`, que mostra a mensagem para fechar a aba.

O volume controla os sons simples gerados por Web Audio. Se o navegador bloquear audio antes de uma interacao, o jogo continua normalmente em silencio.

## Pause

Durante o jogo, ESC alterna o pause.

Comportamento atual:

- O jogo congela enquanto esta pausado.
- A HUD permanece visivel.
- A tela exibe `PAUSE`, a instrucao para continuar com ESC e um botao `Sair`.
- O botao `Sair` tem o mesmo estilo dos botoes do menu e retorna ao menu principal.

## Link local para jogar

Abrir:

`C:\Users\Lorena\Documents\Codex\2026-08-05\que\outputs\cyclelife\index.html`

Tambem existe um pacote atualizado em:

`C:\Users\Lorena\Documents\Codex\2026-08-05\que\outputs\cyclelife.zip`

## Repositorio

GitHub:

`https://github.com/thiagolorena/cyclelife`

Branch principal:

`main`

## Controles

Teclado:

- Mover: setas esquerda/direita ou A/D.
- Pular: Espaco ou seta para cima.
- Correr: Shift.
- Reiniciar fase: R.
- Pausar/continuar: ESC.
- Menu temporario de teste: F.
- Menu: clique em `Jogar`, `Volume` ou `Sair`.

Toque:

- Botoes na tela para esquerda, direita, pulo e corrida em dispositivos touch.

## Menu temporario de teste

Existe um menu temporario para acelerar testes de fase. Ele deve ser removido antes de uma versao final publica.

Comportamento atual:

- Apertar `F` abre ou fecha o seletor de fases.
- Enquanto o seletor esta aberto, o gameplay fica congelado.
- Clicar em `Fase 1`, `Fase 2`, `Fase 3`, `Fase 4` ou `Fase 5` carrega a fase imediatamente.
- Com o seletor aberto, as teclas `1`, `2`, `3`, `4` e `5` tambem carregam a fase correspondente.
- Ao escolher uma fase, o contador de mortes e o cronometro sao reiniciados para facilitar teste isolado.

## Jogador e colisao

O jogador e um quadrado pequeno com animacao simples:

- Movimento lateral com aceleracao.
- Corrida segurando Shift.
- Pulo unico quando esta no chao.
- Animacao basica de pernas ao andar/correr.
- Posicao visual suavizada por interpolacao, sem alterar a fisica real.
- Particulas pequenas ao pular, pousar e morrer.
- Morte por espinho segura o respawn por um instante para mostrar o personagem espetado, com gotas de sangue.
- Sombra simples e leve squash/stretch para dar mais vida ao quadrado.
- Pequeno efeito visual de "blink" apos morrer/renascer.

Colisao atual:

- A colisao fisica com plataformas ainda usa o retangulo completo do jogador para manter pousos consistentes.
- A colisao de dano usa `playerHitbox()`, um retangulo menor que o sprite.
- Nuvens, bombas, espinhos, serras e tesoura possuem hitboxes especificas e menores que o desenho total.
- Nuvens-armadilha nao entram mais na lista de solidos; elas matam por contato e reiniciam no checkpoint sem empurrar o jogador.
- Espinhos de buraco, serras fixas e serras/espinhos que surgem acima do chao usam a animacao de morte espetada.
- A intencao e que o jogador morra quando o contato parece visualmente justo, evitando caixas invisiveis largas demais.

Valores atuais:

- Largura: 22 px.
- Altura: 28 px.
- Gravidade: 0.72.
- Velocidade andando: 3.25.
- Velocidade correndo: 5.2.
- Forca do pulo: -13.2.

## Estrutura das fases

O jogo possui 5 fases. Cada fase tem largura propria, porta de saida, chao segmentado, buracos, checkpoints e armadilhas. A camera acompanha o jogador lateralmente.

Solidos atuais:

- Plataformas de chao em segmentos separados.
- As fases 1, 2 e 3 usam o primeiro sprite da primeira fileira do tileset: grama e terra juntos.
- A fase 4 usa tiles de neve identificados na fileira superior direita do tileset, nos blocos azul-claro/ciano com topo branco.
- A fase 5 adiciona plataformas moveis usando o sprite `assets/platforms.png`.
- Nuvens-armadilha que parecem parte do fundo, mas podem cair.

Blocos cinzas:

- Removidos. Eles nao estavam sendo utilizados como parte essencial do design pedido.

Plataformas falsas/que caem:

- Removidas de todas as fases.
- A mecanica de chao que abre ou cai tambem foi removida do codigo para evitar uso acidental em novas fases.

Saida:

- Porta no fim de cada fase.
- Nas fases 1, 2 e 3, entrar na porta carrega a proxima fase.
- Na fase 4, entrar na porta carrega a fase 5.
- Na fase 5, entrar na porta conclui o jogo e mostra a tela de vitoria.
- A porta da fase 4 fica totalmente apoiada na ultima plataforma.

Fases atuais:

- O jogo exibe apenas `Fase 1`, `Fase 2`, `Fase 3`, `Fase 4` e `Fase 5` para nao entregar a identidade ou truques da fase ao jogador.
- Internamente, cada fase continua com sua propria combinacao de armadilhas e ritmo.

### Fase 5

A fase 5 e focada em paciencia com plataformas moveis.

Comportamento:

- O jogador nasce em uma plataforma fixa.
- A frente existe um grande buraco e varias plataformas que andam sozinhas.
- O jogador precisa esperar cada plataforma chegar em uma posicao boa antes de pular.
- As plataformas comecam em sentidos alternados, evitando que todas se afastem juntas e travem a progressao.
- Cada plataforma sorteia uma velocidade propria quando a fase carrega; o sorteio usa faixas lentas, medias e bem rapidas para ficar perceptivel.
- Esse sorteio acontece somente uma vez no load do nivel.
- Ao morrer, as plataformas nao voltam para a posicao inicial e nao sorteiam nova velocidade.
- Durante o respawn, as plataformas continuam no fluxo atual da fase.
- As plataformas carregam o jogador enquanto ele esta em cima delas.
- As linhas visuais que indicavam o alcance de cada plataforma foram removidas.
- Existem checkpoints presos a plataformas moveis no trajeto para reduzir repeticao apos mortes.
- Esses checkpoints acompanham a plataforma atual e usam a posicao dela no respawn, evitando o jogador voltar no ar sem plataforma embaixo.
- O visual usa a primeira linha verde do sprite `platforms.png`.
- Existe tambem um checkpoint seguro perto da plataforma final.

## Dica inicial

A fase 1 exibe uma dica flutuante discreta perto do inicio.

Comportamento atual:

- Mostra os controles basicos de movimento, pulo e corrida.
- Usa uma caixa pequena com borda dourada e leve flutuacao.
- Desaparece gradualmente assim que o jogador anda um pouco pela fase.

## Checkpoints

Checkpoints atuais:

- Toda fase possui `Start`.
- Fase 1: `Old Switch`, `Quiet Floor` falso/explosivo e `Last Door`.
- Fase 2: `No Return` e `Free Flag` falso/explosivo.
- Fase 3: `Fuse` e `Smoke`.

Comportamento:

- Tocar em checkpoint valido atualiza o ponto de respawn.
- Tocar no checkpoint explosivo mata o jogador, causa flash vermelho e tremor de tela, e retorna para o checkpoint anterior.
- Ao reiniciar com R, o checkpoint volta para `Start`.

## Armadilhas atuais

### Nuvens-armadilha perseguidoras

Elementos do tipo `falling` agora sao desenhados como nuvens do cenario:

- Ativam quando o jogador cruza uma zona invisivel.
- Esperam um delay curto.
- Caem muito mais rapido que na primeira versao.
- Tambem se movem lateralmente em direcao ao jogador.
- Ainda sao esquivaveis caso o jogador reaja rapido.
- Nao devem parecer blocos soltos voando; visualmente precisam parecer parte do ceu/cenario antes da ativacao.

Configuracao atual:

- `ceiling-1`: delay 80 ms.
- `ceiling-2`: delay 45 ms.
- `last-lie`: delay 60 ms.
- Velocidade vertical maxima: 24.
- Velocidade lateral maxima: 8.6.

### Serras escondidas

Armadilhas do tipo `hiddenSaw`:

- Comecam invisiveis.
- Surgem no chao depois que o jogador passa pela area de ativacao.
- Matam ao encostar.
- Nao devem surgir em plataformas verdes muito proximas de espinhos de buraco, para nao criar bloqueios impossiveis.
- A serra escondida inicial da fase 1 foi removida por ficar perto demais da sequencia de espinhos.

### Espinhos de buraco

Os espinhos fixos no chao foram removidos. Os espinhos atuais ficam nos buracos:

- Ficam recolhidos quando o jogador ainda esta se aproximando.
- Disparam quando o centro do corpo do jogador ja esta sobre a area do buraco.
- Sobem muito rapido para matar quem atravessar sem respeitar o timing.
- Sao visualmente menores e mais baixos que nas builds anteriores.
- A altura maxima de cada conjunto e sorteada ao carregar a fase, usando uma escala interna de 1 a 10.
- O sorteio e limitado por um calculo simples do arco de pulo correndo com Shift para evitar uma altura impossivel de atravessar.
- Possuem uma base escura fixa integrada ao fundo do buraco, para nao parecer que uma parte estatica ficou separada de outra que sobe.
- Permanecem altos por um curto periodo.
- Recolhem e entram em cooldown antes de poderem disparar de novo.
- Criam janelas reais de passagem para o jogador, mas sem aviso antecipado generoso.
- Mudam de vermelho para amarelo quando estao perto da altura maxima.
- O jogador ainda morre se cair no fundo do buraco.
- A colisao dos espinhos foi reduzida junto com o sprite, usando uma hitbox mais estreita e menos alta.
- Ao morrer por espinho, o jogador fica espetado por alguns frames, com gotas de sangue, antes de voltar ao checkpoint.
- Espinhos/serras que aparecem acima da terra tambem usam essa mesma morte espetada.

Espinhos de buraco atuais:

- Fase 1: quatro buracos com espinhos acionados por passagem.
- Fase 2: quatro buracos com espinhos acionados por passagem.
- Fase 3: tres buracos com espinhos acionados por passagem.
- Fase 4: cinco buracos com espinhos acionados por passagem.

### Bomba gigante

A bomba gigante aparece na fase 3.

Comportamento:

- Fica parada e visivel na fase antes de ativar.
- Tem visual redondo em pixel art, com corpo escuro, brilho e contador no centro.
- Ativa quando o jogador se aproxima.
- O contador so comeca depois da ativacao.
- Depois de ativada, permanece ativa mesmo se o jogador virar de costas ou recuar.
- Quando fica fora da camera, um indicador na borda mostra sua direcao para nao parecer que desapareceu.
- Persegue o jogador lentamente.
- Mostra contagem regressiva ate 5.
- Ao chegar em zero, explode em uma area grande e mata o jogador se estiver perto.
- Depois da explosao, parece ter acabado, mas volta rapidamente e detona de novo quase imediatamente.
- Esse segundo estouro serve para enganar o jogador que tentar avancar logo apos a primeira explosao.
- Depois do ciclo enganoso, a bomba continua perseguindo.

### Tesoura gigante

A tesoura gigante aparece na fase 4.

Comportamento:

- A fase 4 tem tema de neve.
- Fica visivel no ceu assim que a fase comeca.
- Comeca no canto superior esquerdo, com apenas a ponta aparecendo, para nao bloquear o primeiro pulo.
- Ao renascer em checkpoint na fase 4, a tesoura volta para a posicao superior esquerda relativa ao personagem.
- So comeca a perseguir quando o jogador inicia movimento.
- Tem velocidade igual ao jogador andando.
- O jogador consegue escapar correndo.
- A tesoura ajusta levemente a altura para perseguir o jogador sem sumir da leitura da fase.
- Quando chega perto o suficiente do jogador, entra em estado de golpe.
- No golpe, a tesoura desce e fecha as laminas em uma animacao curta.
- O golpe corta o personagem ao meio, com particulas, sangue, flash e tremor antes do respawn.

### Buracos

Buracos do tipo `pit`:

- Funcionam como zonas de morte.
- Estao posicionados entre segmentos de chao.

## Feedback visual

O jogo possui:

- Tremor de tela em morte e ativacao de armadilhas.
- Flash vermelho em explosoes e eventos perigosos.
- Particulas em pulo, pouso, espinhos, mortes, explosoes e corte da tesoura.
- Neve caindo na tela durante a fase 4.
- Cachecol no personagem apenas na fase 4, por ser a fase de neve.
- Animacao especial de morte espetada nos espinhos.
- Jogador com desenho suavizado, sombra e leve squash/stretch.
- HUD com checkpoint atual, tempo e contador de mortes.
- Tela de vitoria ao concluir a fase 5, exibindo mortes totais e tempo final.
- Sons simples controlados pelo volume do menu.

## Build atual

Como o projeto e estatico, "build" significa:

1. Atualizar arquivos em `work/cyclelife`.
2. Validar sintaxe com `node --check game.js`.
3. Copiar a versao jogavel para `outputs/cyclelife`.
4. Atualizar `outputs/cyclelife.zip`.
5. Fazer commit.
6. Fazer push para `thiagolorena/cyclelife`.
7. Informar o link local jogavel e os detalhes da build.

## Build itch.io

Para itch.io, usar o pacote:

`C:\Users\Lorena\Documents\Codex\2026-08-05\que\outputs\cyclelife-itch-html5.zip`

Formato do pacote:

- `index.html` na raiz do zip.
- `style.css` na raiz do zip.
- `game.js` na raiz do zip.
- Pasta `assets/` na raiz do zip.
- Sem `.git`, docs ou arquivos extras.

Configuracao recomendada no itch.io:

- Kind of project: HTML.
- Upload: `cyclelife-itch-html5.zip`.
- Marcar a opcao para o arquivo ser jogado no navegador.

## Historico de commits principais

- `e0d23a2`: prototipo inicial jogavel.
- `0276730`: merge com commit inicial do repositorio remoto.
- `060aaa0`: ajuste das armadilhas mortais, blocos perseguidores, espinhos expansivos e checkpoint explosivo.
- `b8cd9da`: nuvens-armadilha integradas ao cenario e espinhos com ciclos variaveis de subida/descida.
- `1ff09d2`: menu animado, controle de volume, tres fases, espinhos somente nos buracos e bomba gigante na fase 3.
- `1de13b0`: remocao da armadilha escondida na plataforma verde da fase 1 para preservar uma janela justa entre espinhos.
- `d166137`: nomes publicos das fases sem subtitulo revelador, pause com ESC e dica flutuante inicial.
- `ae628d1`: bomba final permanece visivel/indicada depois de ativada e tela final mostra mortes e tempo total.
- `3f67913`: normalizacao da fisica por tempo para manter a mesma velocidade em navegadores/monitores com FPS diferente.
- `ebff00d`: loading com logo Silver Feather, hitboxes de dano mais justas, espinhos acionados quando o jogador esta sobre o buraco, quarta fase com tesoura gigante perseguidora e novos FX.
- `08295de`: menu temporario de teste acionado por `F` para escolher fases imediatamente.
- `7314bff`: tesoura da fase 4 reposicionada para comecar fora da rota do pulo, chao falso abrindo como buraco real e nuvens corrigidas para matar com respawn limpo.
- `780d75e`: plataformas falsas removidas de todas as fases, espinhos redesenhados menores com base integrada, hitbox reduzida e animacao de morte espetada com gotas.
- `dacb88b`: espinhos com altura aleatoria segura por fase, morte espetada tambem para espinhos acima do chao, porta da fase 4 reposicionada, tesoura reajustada por checkpoint e bomba redonda visivel antes da ativacao.
- `57f761b`: tileset aplicado ao chao, fase 4 convertida para tema de neve, neve caindo na tela e cachecol no personagem.
- `127f3f8`: cachecol limitado a fase 4 e tesoura com golpe de corte quando chega perto do jogador.
- `c10bfa6`: tecla `W` removida do comando de pulo; pulo permanece em Espaco e seta para cima.
- `6294d38`: menu inicial com animacao do jogador correndo de uma marreta gigante sem ser atingido.
- `cf2cbf7`: animacao da marreta reposicionada para usar o chao verde existente do menu, como segundo plano atras dos botoes.
- `9a5a1f5`: quinta fase adicionada com plataformas moveis automaticas e sprite dedicado.
- `1f1c532`: plataformas moveis da fase 5 agora iniciam em sentidos alternados para abrir janelas reais de pulo.
- `75635d9`: plataformas moveis da fase 5 com velocidades randomicas por carregamento e sem reset de fluxo apos morte.
- `8f7587f`: faixa de velocidade das plataformas moveis ampliada para deixar plataformas rapidas claramente perceptiveis, mantendo sorteio apenas no load do nivel.
- `633276d`: linhas-guia das plataformas moveis removidas e checkpoints suspensos adicionados na fase 5.
- `641d414`: checkpoints da fase 5 presos as plataformas moveis para respawn seguro sobre a plataforma atual.
- Versao atual: build HTML5 para itch.io gerada em `outputs/cyclelife-itch-html5.zip`.

## Proximos caminhos sugeridos

- Criar formato de fases baseado em JSON.
- Adicionar sprites reais para jogador, blocos, serras, espinhos e porta.
- Criar efeitos sonoros para pulo, morte, checkpoint, explosao e serra.
- Adicionar cronometro de melhor tempo.
- Criar indicador sutil para checkpoints falsos, caso a dificuldade fique injusta demais.
- Fazer deploy em GitHub Pages para ter link web publico jogavel.
