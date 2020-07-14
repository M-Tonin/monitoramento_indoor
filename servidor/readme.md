# Servidor e Banco de Dados

## Responsáveis:
* Fernando, Renato e Saulo.
-------------
## Overview:
* Servidor em Flask / Python;
* Banco de Dados local em MySQL.
-------------
## Recursos utilizados:
* Python;
  * Flask;
  * Protocolo HTTP;
* ngrok;
* MySQL;
* Workbench;
* TTN;
  * Protocolo MQTT.
-------------
## Pontes de comunicação do servidor:
<img src="/Imagens/pontes de conexão do servidor.png" width="612" height="480">
-------------
## Arquivos desenvolvidos pela equipe:
* server.py
  * Programa servidor em si, que realiza todas as pontes de comunicação entre os dispositivos, o aplicativo e o banco de dados.
* server_utils.py
  * Biblioteca auxiliar desenvolvida para externalizar chamadas de funções de outras bibliotecas, operações de bytes, preparação de pacotes para envios, setups de conexões e afins do programa do servidor, afim de deixá-lo mais enxuto e de fácil leitura e compreensão.
* mySqlLib_Server.py
  * Biblioteca com todos os recursos necessários para a utilização das operações MySQL que o servidor precisa para se comunicar com o banco de dados.
* dictTreatLib_Server.py
  * Biblioteca auxiliar que faz o tratamento de dados retirados do banco de dados para serem enviados à aplicação de forma que facilite a leitura dos mesmos.
