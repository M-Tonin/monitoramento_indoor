-- Esta PROCEDURE percorre todos os registros da tabela 'tb_estado_dispositivo',
-- após uma data especificada, e insere as diferenças de tempo de luminosidade 
-- na tabela 'tb_sumario'.
-- ATENÇÃO!
-- É necessário truncar a tabela 'tb_sumario' antes executar esta PROCEDURE!
-- Para trucar a tabela execute o seguinte comando: TRUNCATE TABLE tb_sumario;
-- COMANDO PADRÃO PARA CHAMAR A PROCEDURE: CALL pr_insere_sumario(STR_TO_DATE('2020-01-01','%Y-%m-%d'));
-- Basta-se substituir a data acima para a data inicial desejada.
-- PARA RODAR TODOS OS COMANDOS ACIMA, SELECIONE O BANCO 'db_indoor', E DEPOIS SELECIONE A ABA 'SQL'!

USE `db_indoor`;

DELIMITER //

CREATE OR REPLACE PROCEDURE `pr_insere_sumario` (IN dt_inicial DATE)
BEGIN
	DECLARE done INT DEFAULT FALSE;
	DECLARE IDD INT;
	DECLARE DTO DATE;
	DECLARE HRO TIME;
	DECLARE STE CHAR(1);
	DECLARE estado_dispositivo CURSOR FOR SELECT id_dispositivo,dt_ocorrencia,hr_ocorrencia,st_estado
										  FROM tb_estado_dispositivo
										  WHERE dt_ocorrencia >= dt_inicial;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	IF EXISTS (SELECT * FROM tb_estado_dispositivo
			   WHERE dt_ocorrencia >= dt_inicial) THEN
		OPEN estado_dispositivo;
		
		insere: LOOP
			FETCH estado_dispositivo INTO IDD,DTO,HRO,STE;
			IF done THEN
				LEAVE insere;
			END IF;
			
			IF STE = '0' THEN
				IF EXISTS(SELECT * FROM tb_estado_dispositivo
						  WHERE id_dispositivo = IDD
						  AND TIMESTAMP(dt_ocorrencia,hr_ocorrencia) <
							  TIMESTAMP(DTO,HRO)
						  AND st_estado = '1') THEN
					
					SELECT hr_ocorrencia
					INTO @hr_ult_ocorrencia
					FROM tb_estado_dispositivo
					WHERE id_dispositivo = IDD
					AND TIMESTAMP(dt_ocorrencia,hr_ocorrencia) <
					    TIMESTAMP(DTO,HRO)
					AND st_estado = '1'
					ORDER BY id_estado_dispositivo DESC, TIMESTAMP(dt_ocorrencia,hr_ocorrencia) DESC
					LIMIT 1;
					
					INSERT INTO tb_sumario(id_dispositivo,dt_ocorrencia,hr_ocorrencia,hr_diferenca_luminosidade)
					VALUES (IDD,DTO,HRO,TIMEDIFF(HRO,@hr_ult_ocorrencia));
					COMMIT;
					
				END IF;
			END IF;
		END LOOP;
		
		CLOSE estado_dispositivo;
		
	END IF;
END;//

DELIMITER ;