#Esta é uma biblioteca básica para a criação dos dicionários que serão utilizados 
#na serialização JSON que será enviada para aplicação

#Importando o módulo timedelta da biblioteca datetime
from datetime import timedelta

#CLASSES
class DispositivoEnvio:
    def __init__(self, idD = None, noLoc = None, noDisp = None, stLum = ''):
        self.idDispositivo = idD
        self.localDispositivo = noLoc
        self.nomeDispositivo = noDisp
        self.statusLuminosidade = stLum
        
class OcorrenciaEnvio:
    def __init__(self,vlTmp = None,dtReg = None, hrReg = None):
        self.temperatura = vlTmp
        self.dataRegistro = dtReg
        self.horaRegistrada = hrReg
        
class DiffTempHoraEnvio:
    def __init__(self,ultTemp = None,hrReg = None):
        self.ultimaTemperatura = ultTemp
        self.horaRegistrada = hrReg
                
class OcorrenciasDict:
    def __init__(self,ocs = None):
        if ocs is None:
            ocs = []
        self.ocorrencias = ocs
        
class DispositivosDict:
    def __init__(self,dps = None):
        if dps is None:
            dps = []
        self.dispositivos = dps
        
class UltTempDict:
    def __init__(self,diffTmpHr = None):
        self.ultTempHoraRegistrada = diffTmpHr
        
class DiffTempHoraDict:
    def __init__(self,diffTemp = None,diffHr = None):
        self.diferencaTemperatura = diffTemp
        self.diferencaMin = diffHr
        
class FreqDispDict:
    def __init__(self,freqDisp = None):
        self.frequenciaDoDispositivo = freqDisp

#FIM DAS CLASSES


#FUNCTIONS

#Esta função gera um objeto contendo dicionários com os dados da tabela de ocorrências 
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_ocorrencia
#   Retorno: um objeto com os dicionários
def getOcorrenciaDict(res):
    ocDict = OcorrenciasDict()
    for row in res:       
        oc = OcorrenciaEnvio(float(row[2]),str(row[4]),str(row[5]))
        ocDict.ocorrencias.append(vars(oc))
    return vars(ocDict)


#Esta função gera um objeto contendo dicionários com os dados da tabela de dispositivos 
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_dispositivo e tb_ocorrencia,
#               com o status da luminosidade de cada dispositivo
#   Retorno: um objeto com os dicionários    
def getDispositivosDict(res):
    dpDict = DispositivosDict()
    for row in res:       
        dp = DispositivoEnvio(row[0],str(row[1]),str(row[2]), str(row[6]))
        dpDict.dispositivos.append(vars(dp))
    return vars(dpDict)
    

#Esta função gera um objeto contendo um dicionário com o valor a última temperatura 
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_ocorrencia, com a temperatura da
#                última ocorrência
#   Retorno: um objeto com o dicionário     
def getUltTempDict(res):
    ultTempDict = UltTempDict()
    for row in res:
        dth = DiffTempHoraEnvio(float(row[0]),str(row[1]))
        ultTempDict.ultTempHoraRegistrada = vars(dth)
    return vars(ultTempDict)


#Esta função gera um objeto contendo um dicionário com o valor da diferença entra as temperaturas e o tempo
#em minutos da ultima ocorrência de cada dispositivo
#   Parâmetros: resultado de uma pesquisa 'SELECT' com 'UNION ALL'na tabela tb_ocorrencia, com os valores de
#               de temperatura e hora da última ocorrência de cada dispositivo
#   Retorno: um objeto com o dicionário      
def getDiffTempDict(res):
    diffTempDict = DiffTempHoraDict()
    i = 0
    for i in range(0,len(res),1):
        if(i > 0):
            diffTempDict.diferencaTemperatura = round(abs(float(res[i][0]) - float(res[i - 1][0])),1)
            diffTempDict.diferencaMin = int(round(abs(int(timedelta.total_seconds(res[i][1] - res[i - 1][1])) / 60),0))
    return vars(diffTempDict)


#Esta função gera um objeto contendo um dicionário com o valor da frequência de envio de um dispositivo
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_dispositivo, com a frequência de envio
#   Retorno: um objeto com o dicionário  
def getFreqDispDict(res):
    freqDispDict = FreqDispDict()
    for row in res:
        freqDispDict.frequenciaDoDispositivo = float(row[0])
    return vars(freqDispDict)
    
    
#Esta função concatena uma lista de dicionários para a serialização JSON
#   Parâmetros: uma lista de dicionários de objetos
#   Retorno: os dicionários concatenados

def concatDicts (listaDicts):
    allDicts = {}
    for dicio in listaDicts:
        allDicts.update(dicio)
    return allDicts
    
#FIM DAS FUNCTIONS