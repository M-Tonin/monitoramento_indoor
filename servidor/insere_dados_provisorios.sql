-- Este script insere dados de teste para o banco de dados 'db_indoor'.

-- Insere dois dispositivos(caso não existam) e 100 ocorrências para cada dispostivo.

-- Caso já exista ocorrências para um dos dispositivos, insere até 100
-- ocorrências do dispositivo existente para o dispositivo criado.

-- Caso já exista ocorrências para os dois dispositivos, a inserção de dados
-- não ocorrerá!

-- Para alterar a quantidade de ocorrências inseridas, basta mudar o parâmentro
-- da chamada do PROCEDURE.

-- Por padrão, as ocorrências serão geradas com status de luminosidade em '1' (aceso).



-- Inserindo dispositivos
DELIMITER //

CREATE OR REPLACE PROCEDURE insere_dispositivos ()
BEGIN
	DECLARE cont INT;
	SELECT count(*)
	INTO cont
	FROM tb_dispositivo
	WHERE st_ativo = 'A';
	
	IF cont < 1 THEN
		INSERT INTO tb_dispositivo (id_dispositivo,no_localizacao,
									no_dispositivo,vl_min_luminosidade,
									vl_frequencia_captura)
		VALUES(1,'IBTI','120.0.0.1',10,5),
			  (2,'IBTI','120.0.0.2',10,10);
	ELSEIF cont < 2 THEN
		INSERT INTO tb_dispositivo (id_dispositivo,no_localizacao,
									no_dispositivo,vl_min_luminosidade,
									vl_frequencia_captura)
		VALUES(2,'IBTI','120.0.0.2',10,10);
	END IF;
END;//

DELIMITER ;


-- Inserindo ocorrências
DELIMITER //

CREATE OR REPLACE PROCEDURE insere_ocorrencias (IN qtde_ocorrencias INT)
BEGIN
	DECLARE done INT DEFAULT FALSE;
	DECLARE TMP NUMERIC(3,1);
	DECLARE IDO,LUM,c,fator INT;
	DECLARE DAT DATE;
	DECLARE HRO,curr_time TIME;
	DECLARE STS CHAR(1);
	DECLARE cursor1 CURSOR FOR SELECT SEL1.* FROM 
							  (SELECT id_ocorrencia,vl_temperatura,
									  vl_luminosidade,dt_ocorrencia,
									  hr_ocorrencia,st_luminosidade
							   FROM tb_ocorrencia WHERE id_dispositivo = 1 
							   ORDER BY id_ocorrencia DESC
							   LIMIT qtde_ocorrencias) AS SEL1
							   ORDER BY SEL1.id_ocorrencia ASC;
	DECLARE cursor2 CURSOR FOR SELECT SEL2.* FROM
							  (SELECT id_ocorrencia,vl_temperatura,
									  vl_luminosidade,dt_ocorrencia,
									  hr_ocorrencia,st_luminosidade
							   FROM tb_ocorrencia WHERE id_dispositivo = 2
							   ORDER BY id_ocorrencia DESC
							   LIMIT qtde_ocorrencias) AS SEL2
							   ORDER BY SEL2.id_ocorrencia ASC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	SET fator = qtde_ocorrencias * 2 * -60 - 120;
	IF EXISTS (SELECT * FROM tb_ocorrencia) THEN
		IF NOT EXISTS (SELECT * FROM tb_ocorrencia 
					   WHERE id_dispositivo = 1) THEN					  
		    OPEN cursor2;
			
			insere1: LOOP
				FETCH cursor2 INTO IDO,TMP,LUM,DAT,HRO,STS;
				IF done THEN
					LEAVE insere1;
				END IF;
				INSERT INTO tb_ocorrencia(id_dispositivo,vl_temperatura,
										  vl_luminosidade,dt_ocorrencia,
										  hr_ocorrencia,st_luminosidade) 
				VALUES (1,TMP + ROUND(-0.2+(RAND()*0.4),1),LUM,DAT,ADDTIME(HRO,SEC_TO_TIME(-60)),STS);
				COMMIT;
			END LOOP;
		ELSEIF NOT EXISTS (SELECT * FROM tb_ocorrencia 
							WHERE id_dispositivo = 2) THEN
			OPEN cursor1;
			
			insere2: LOOP
				FETCH cursor1 INTO IDO,TMP,LUM,DAT,HRO,STS;
				IF done THEN
					LEAVE insere2;
				END IF;
				INSERT INTO tb_ocorrencia(id_dispositivo,vl_temperatura,
										  vl_luminosidade,dt_ocorrencia,
										  hr_ocorrencia,st_luminosidade) 
				VALUES (2,TMP + ROUND(-0.2+(RAND()*0.4),1),LUM,DAT,ADDTIME(HRO,SEC_TO_TIME(-60)),STS);
				COMMIT;
			END LOOP;
		END IF;
	ELSE
		SET c = 0;
		SET curr_time = ADDTIME(CURRENT_TIME,SEC_TO_TIME(fator));
		init: LOOP
			SET c = c + 1;
			IF c > qtde_ocorrencias THEN
				LEAVE init;
			END IF;
			SET curr_time = ADDTIME(curr_time,SEC_TO_TIME(60));
			INSERT INTO tb_ocorrencia(id_dispositivo,vl_temperatura,
									  vl_luminosidade,dt_ocorrencia,
									  hr_ocorrencia,st_luminosidade) 
			VALUES (1,ROUND(27+(RAND()*3),1),FLOOR(395+(RAND()*10)),CURRENT_DATE,curr_time,'1');
			COMMIT;
			SET curr_time = ADDTIME(curr_time,SEC_TO_TIME(60));
			INSERT INTO tb_ocorrencia(id_dispositivo,vl_temperatura,
									  vl_luminosidade,dt_ocorrencia,
									  hr_ocorrencia,st_luminosidade) 
			VALUES (2,ROUND(27+(RAND()*3),1),FLOOR(395+(RAND()*10)),CURRENT_DATE,curr_time,'1');
			COMMIT;
		END LOOP init;
	END IF;
END;//

DELIMITER ;

CALL insere_dispositivos();
CALL insere_ocorrencias(100);

DROP PROCEDURE insere_dispositivos;
DROP PROCEDURE insere_ocorrencias;
