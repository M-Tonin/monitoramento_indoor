#Biblioteca básica de tratamento de objetos


#Palavras reservados do banco mySql
dbReservedWords = ['CURRENT_DATE','CURRENT_TIME'] 

#Esta função retorna o nome de um objeto
#   Parametros: o objeto
#   Retorno: o nome do objeto em formato string
def getObjName (obj):
    return str(type(obj).__name__)


#Esta função retorna o nome das variáveis de um objeto
#   Parametros: o objeto
#   Retorno: a lista dos nomes das variáveis do objeto, em string
def getVarsNames (obj):
    varsList = list(vars(obj))
    i = 0
    varsStr = ''
    for var in varsList:
        if i == 0:
            varStr = str(var)
            i += 1 
        else:
            varStr = varStr+','+str(var)
        
    return varStr


#Esta função retorna o valor das variáveis de um objeto
#   Parametros: o objeto
#   Retorno: a lista com os valores das variáveis de um objeto  
def getVarsValues(obj):
    varDict = vars(obj)
    varsNameList = list(vars(obj))
    i = 0;
    varStr = ''
    varValueList = []
    for varName in varsNameList:
        varValueList.append(varDict[varName]);
    for varValue in varValueList:
        if i == 0:
            if(type(varValueList[i]) == str and str(varValue) not in dbReservedWords):
                varStr = "'"+str(varValue)+"'"
            else:
                varStr = str(varValue)            
        else:
            if(type(varValueList[i]) == str and str(varValue) not in dbReservedWords):
                varStr = varStr+','+"'"+str(varValue)+"'"
            else:
                varStr = varStr+','+str(varValue)
        i += 1
    return varStr