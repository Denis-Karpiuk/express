const { createLogger, format, transports } = require('winston')
const { ElasticsearchTransport } = require('winston-elasticsearch')

// Настройки транспорта Elasticsearch
const esTransportOpts = {
	level: 'info',
	clientOpts: { node: 'http://localhost:9200' }, // Укажите адрес вашего Elasticsearch
	transformer: logData => {
		return {
			'@timestamp': logData.timestamp, // Временная метка для Kibana
			severity: logData.level, // Уровень логирования
			message: logData.message, // Основное сообщение
			fields: logData.metadata || {}, // Любая дополнительная информация
		}
	},
}

const logger = createLogger({
	format: format.combine(
		format.timestamp(), // Добавление временной метки
		format.json() // Формат JSON для логов
	),
	transports: [
		new transports.Console(), // Вывод логов в консоль
		new ElasticsearchTransport(esTransportOpts), // Отправка логов в Elasticsearch
	],
})

module.exports = logger
