## Aplicação

### Responsáveis:
  * Arley e Silvio
---------------------------------
* Mobile  

  * Gráfico do dia
  * Droplist
  * Temperatura atual
  * Luminosidade atual
  * Limiar de temperatura baixa
  * Status de Luminosidade
  * Diferença de temperatura entre os dois sensores.
  * Comando para acionar buzzer 
---------------------------------------

<h3><b>Requisitos Monitoramento Indoor</b></h3>
<p>
 <ol>
  <li>O aplicativo deverá possuir uma única tela, que será a Home, onde iniciará imediatamente após a Splash Screen. Esta tela listará os dispositivos e indicará algumas informações gerais.</li>
  <li>A exibição dos detalhes dos dispositivos será on demand, ou seja, somente será exibido os detalhes do dispositivo desejado, um por vez.</li>
  <li>O aplicativo deverá possibilitar o ajuste da frequência de envio dos dados de cada dispositivo separadamente.</li>
  <li>Nos detalhes de cada dispositivo, deverão ser exibidas informações sobre o dispositivo (Nome, local de instalação, última temperatura registrada por ele, se a luz está ligada ou desligada, campo para seleção de nova frequência, botão para salvar a nova frequência desejada e um gráfico das temperaturas registradas nas últimas 24 horas).</li>
  <li>Para exibir os valores das temperaturas registradas nas últimas 24 horas será utilizado o gráfico de linha.</li>
  <li>O cliente deseja um gráfico de pizza para exibição da luminosidade</li>
  <li>Para indicar se a luz está ligada ou desligada, será utilizado um botão Switch (do tipo interruptor off/on), que não poderá receber interação do usuário, sendo apenas para visualização do estado da luz.</li>
 </ol>
</p>

<p>
 Em reunião realizada com os clientes, fizemos os primeiros levantamentos de requisitos para a aplicação, tendo esclarecido grande parte do projeto, tendo assim extraído diversos pontos. No início da reunião, realizamos uma mistura de questionário com brainstorm, onde não só levantamos os requisitos desejados, como também demos algumas sugestões. Foi discutido como seria a entrada no aplicativo, o que seria exibido assim que o usuário clicasse no ícone da aplicação. O cliente decidiu que poderia ser um ícone da própria empresa, utilizando sua logo. Após esta entrada, deveriam ser dispostas imediatamente as informações dos dispositivos. Para deixar o aplicativo mais enxuto e organizado, demos a sugestão de utilizar dropdowns para listar os dispositivos, de modo que as informações do dispositivo ficam ocultas até o momento em que o usuário clica para vê-las, expandido o dropdown, que até então fica compactado para não ocupar tanto espaço na tela, reduzindo assim a poluição visual desnecessária.

Ficou estabelecido que o aplicativo deverá se comunicar com o Servidor, de onde extrairá as informações e para onde enviará as possíveis solicitações de alteração no comportamento do dispositivo, como por exemplo, a alteração da frequência de envio dos dados. O cliente deseja que ao realizar a alteração da frequência de envio de um dispositivo, o mesmo, emita um som de aviso.

Para uma melhor visualização dos dados coletados pelos dispositivos, foi requerido o uso de gráfico de linha, que ficará dentro dos dropdowns, juntamente com as demais informações pertinentes ao respectivo dispositivo, coletadas nas últimas 24 horas. O gráfico de pizza para exibição da luminosidade não foi confirmado pelo cliente ainda.
</p>

<h3><b>Icon</b></h3>
<p>O cliente decidiu que o ícone do aplicativo poderia ser a logo da empresa (IBTI), e que ao clicar nele, seria aberto a Splash Screen que também possuirá o ícone da empresa, com um fundo um pouco estilizado. Em seguida, será apresentada a tela Home, que será a única tela do aplicativo.</p>

<h3><b>Tela principal</b></h3>
<p>Ao abrir a tela Home serão exibidos todos os dispositivos cadastrados, possibilitando ao usuário escolher um dispositivo para visualizar seus detalhes. Ao final da tela Home serão exibidas as informações</p>
<ul>
 <li>Diferença de temperatura entre o último registro de cada dispositivo.</li>
 <li>Última temperatura registrada (no geral, independente do dispositivo).</li>
 <li>Hora da última temperatura registrada (item B).</li>
</ul>
<img src="https://user-images.githubusercontent.com/32252053/87790233-9f8ee800-c816-11ea-9c01-8a6a5add33da.jpg" width="250" heigth="300"/>

<h3><b>Dropdown Expandido</b></h3>
<p>Ao abrir o dropdown, o usuário terá acesso aos dados daquele dispositivo específico, que serão:</p>
<ul>
 <li>Nome do dispositivo</li>
 <li>Local</li>
 <li>Última temperatura registrada</li>
 <li>Estado da luz (on/off)</li>
 <li>Gráfico de linha com as temperaturas das ultimas 24 horas.</li>
 <li>Compos para controle da frequência de envio das informações</li>
 <li>Botão salvar alteração de frequência</li>
</ul>


