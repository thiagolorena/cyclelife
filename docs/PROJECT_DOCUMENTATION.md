# Cyclelife - Documentacao do Projeto

Ultima atualizacao: 2026-08-05

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

O jogador possui apenas uma vida. Ao morrer, ele retorna ao inicio da fase ou ao ultimo checkpoint valido. O objetivo da fase e chegar ate uma porta. A dificuldade vem de armadilhas que parecem parte normal do mapa, mas reagem ao jogador: nuvens do cenario caem, chao desaparece, serras aparecem, espinhos sobem e descem, e checkpoints podem enganar.

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
- `game.js`: loop principal, fisica, colisao, camera, fase, armadilhas, checkpoints e renderizacao.
- `README.md`: resumo publico do projeto.
- `docs/PROJECT_DOCUMENTATION.md`: documentacao completa e parametro de trabalho.

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
- Pular: Espaco, W ou seta para cima.
- Correr: Shift.
- Reiniciar fase: R.

Toque:

- Botoes na tela para esquerda, direita, pulo e corrida em dispositivos touch.

## Jogador

O jogador e um quadrado pequeno com animacao simples:

- Movimento lateral com aceleracao.
- Corrida segurando Shift.
- Pulo unico quando esta no chao.
- Animacao basica de pernas ao andar/correr.
- Pequeno efeito visual de "blink" apos morrer/renascer.

Valores atuais:

- Largura: 22 px.
- Altura: 28 px.
- Gravidade: 0.72.
- Velocidade andando: 3.25.
- Velocidade correndo: 5.2.
- Forca do pulo: -13.2.

## Estrutura da fase

A fase atual tem largura de 3720 px e altura de 540 px. A camera acompanha o jogador lateralmente.

Solidos atuais:

- Plataformas verdes de chao em segmentos separados.
- Nuvens-armadilha que parecem parte do fundo, mas podem cair.
- Pontes falsas do tipo `crumbly`, que desaparecem quando ativadas.

Blocos cinzas:

- Removidos. Eles nao estavam sendo utilizados como parte essencial do design pedido.

Saida:

- Porta no fim da fase em `x = 3568`, `y = 386`.

## Checkpoints

Checkpoints atuais:

- `Start`: ponto inicial.
- `Old Switch`: checkpoint valido.
- `Quiet Floor`: checkpoint falso/explosivo.
- `Last Door`: checkpoint valido perto da saida.

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

### Pontes falsas

Armadilhas do tipo `crumbly`:

- Parecem chao normal.
- Ao ativar, descem rapidamente e perdem altura.
- Criam buracos inesperados.

### Espinhos ciclicos

Alguns espinhos do chao agora:

- Sobem e descem em intervalos variaveis.
- Podem ficar totalmente baixos ou praticamente sumidos.
- Criam janelas reais de passagem para o jogador.
- Mudam de vermelho para amarelo quando estao perto da altura maxima.
- Cada conjunto possui ritmo proprio para evitar um padrao unico e previsivel demais.

Espinhos ciclicos atuais:

- Em torno de `x = 900`, periodo 2600 ms.
- Em torno de `x = 1458`, periodo 3300 ms.
- Em torno de `x = 2810`, periodo 4100 ms.

### Buracos

Buracos do tipo `pit`:

- Funcionam como zonas de morte.
- Estao posicionados entre segmentos de chao.

## Feedback visual

O jogo possui:

- Tremor de tela em morte e ativacao de armadilhas.
- Flash vermelho em explosoes e espinhos expansivos.
- HUD com checkpoint atual, tempo e contador de mortes.
- Overlay de vitoria ao chegar na porta.

## Build atual

Como o projeto e estatico, "build" significa:

1. Atualizar arquivos em `work/cyclelife`.
2. Validar sintaxe com `node --check game.js`.
3. Copiar a versao jogavel para `outputs/cyclelife`.
4. Atualizar `outputs/cyclelife.zip`.
5. Fazer commit.
6. Fazer push para `thiagolorena/cyclelife`.
7. Informar o link local jogavel e os detalhes da build.

## Historico de commits principais

- `e0d23a2`: prototipo inicial jogavel.
- `0276730`: merge com commit inicial do repositorio remoto.
- `060aaa0`: ajuste das armadilhas mortais, blocos perseguidores, espinhos expansivos e checkpoint explosivo.
- Build atual em desenvolvimento: nuvens-armadilha integradas ao cenario e espinhos com ciclos variaveis de subida/descida.

## Proximos caminhos sugeridos

- Criar formato de fases baseado em JSON.
- Adicionar sprites reais para jogador, blocos, serras, espinhos e porta.
- Criar efeitos sonoros para pulo, morte, checkpoint, explosao e serra.
- Adicionar tela de menu e selecao de fases.
- Adicionar cronometro de melhor tempo.
- Criar indicador sutil para checkpoints falsos, caso a dificuldade fique injusta demais.
- Fazer deploy em GitHub Pages para ter link web publico jogavel.
