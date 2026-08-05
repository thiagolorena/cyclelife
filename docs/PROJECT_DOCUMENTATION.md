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

O jogador possui apenas uma vida. Ao morrer, ele retorna ao inicio da fase ou ao ultimo checkpoint valido. O objetivo de cada fase e chegar ate uma porta. A dificuldade vem de armadilhas que parecem parte normal do mapa, mas reagem ao jogador: nuvens do cenario caem, chao desaparece, serras aparecem, espinhos sobem de buracos, checkpoints podem enganar e uma bomba gigante persegue o jogador na fase final.

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

## Menu do jogo

O jogo abre em um menu animado renderizado no canvas.

Elementos atuais:

- Titulo `CYCLELIFE`.
- Fundo com nuvens animadas e chao pixel art.
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
- Pular: Espaco, W ou seta para cima.
- Correr: Shift.
- Reiniciar fase: R.
- Pausar/continuar: ESC.
- Menu: clique em `Jogar`, `Volume` ou `Sair`.

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

## Estrutura das fases

O jogo possui 3 fases. Cada fase tem largura propria, porta de saida, chao segmentado, buracos, checkpoints e armadilhas. A camera acompanha o jogador lateralmente.

Solidos atuais:

- Plataformas verdes de chao em segmentos separados.
- Nuvens-armadilha que parecem parte do fundo, mas podem cair.
- Pontes falsas do tipo `crumbly`, que desaparecem quando ativadas.

Blocos cinzas:

- Removidos. Eles nao estavam sendo utilizados como parte essencial do design pedido.

Saida:

- Porta no fim de cada fase.
- Nas fases 1 e 2, entrar na porta carrega a proxima fase.
- Na fase 3, entrar na porta conclui o jogo e mostra a tela de vitoria.

Fases atuais:

- O jogo exibe apenas `Fase 1`, `Fase 2` e `Fase 3` para nao entregar a identidade ou truques da fase ao jogador.
- Internamente, cada fase continua com sua propria combinacao de armadilhas e ritmo.

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

### Pontes falsas

Armadilhas do tipo `crumbly`:

- Parecem chao normal.
- Ao ativar, descem rapidamente e perdem altura.
- Criam buracos inesperados.

### Espinhos de buraco

Os espinhos fixos no chao foram removidos. Os espinhos atuais ficam nos buracos:

- Sobem e descem em intervalos variaveis.
- Podem ficar totalmente baixos ou praticamente sumidos.
- Criam janelas reais de passagem para o jogador.
- Mudam de vermelho para amarelo quando estao perto da altura maxima.
- Cada conjunto possui ritmo proprio para evitar um padrao unico e previsivel demais.
- O jogador ainda morre se cair no fundo do buraco.

Espinhos de buraco atuais:

- Fase 1: quatro buracos com espinhos ciclicos.
- Fase 2: quatro buracos com espinhos ciclicos.
- Fase 3: tres buracos com espinhos ciclicos.

### Bomba gigante

A bomba gigante aparece na fase 3.

Comportamento:

- Ativa quando o jogador avanca pela fase final.
- Depois de ativada, permanece ativa mesmo se o jogador virar de costas ou recuar.
- Quando fica fora da camera, um indicador na borda mostra sua direcao para nao parecer que desapareceu.
- Persegue o jogador lentamente.
- Mostra contagem regressiva ate 5.
- Ao chegar em zero, explode em uma area grande e mata o jogador se estiver perto.
- Depois da explosao, parece ter acabado, mas volta rapidamente e detona de novo quase imediatamente.
- Esse segundo estouro serve para enganar o jogador que tentar avancar logo apos a primeira explosao.
- Depois do ciclo enganoso, a bomba continua perseguindo.

### Buracos

Buracos do tipo `pit`:

- Funcionam como zonas de morte.
- Estao posicionados entre segmentos de chao.

## Feedback visual

O jogo possui:

- Tremor de tela em morte e ativacao de armadilhas.
- Flash vermelho em explosoes e eventos perigosos.
- HUD com checkpoint atual, tempo e contador de mortes.
- Tela de vitoria ao concluir a fase 3, exibindo mortes totais e tempo final.
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

## Historico de commits principais

- `e0d23a2`: prototipo inicial jogavel.
- `0276730`: merge com commit inicial do repositorio remoto.
- `060aaa0`: ajuste das armadilhas mortais, blocos perseguidores, espinhos expansivos e checkpoint explosivo.
- `b8cd9da`: nuvens-armadilha integradas ao cenario e espinhos com ciclos variaveis de subida/descida.
- `1ff09d2`: menu animado, controle de volume, tres fases, espinhos somente nos buracos e bomba gigante na fase 3.
- `1de13b0`: remocao da armadilha escondida na plataforma verde da fase 1 para preservar uma janela justa entre espinhos.
- `d166137`: nomes publicos das fases sem subtitulo revelador, pause com ESC e dica flutuante inicial.
- Versao atual: bomba final permanece visivel/indicada depois de ativada e tela final mostra mortes e tempo total.

## Proximos caminhos sugeridos

- Criar formato de fases baseado em JSON.
- Adicionar sprites reais para jogador, blocos, serras, espinhos e porta.
- Criar efeitos sonoros para pulo, morte, checkpoint, explosao e serra.
- Adicionar cronometro de melhor tempo.
- Criar indicador sutil para checkpoints falsos, caso a dificuldade fique injusta demais.
- Fazer deploy em GitHub Pages para ter link web publico jogavel.
