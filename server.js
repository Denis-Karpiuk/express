const express = require('express')
const { engine } = require('express-handlebars')
const path = require('path')
const logger = require('./logger')
const fortune = require('./src/lib/fortune')

// Создаем приложение Express
const app = express()
const port = process.env.PORT || 3000

// Настраиваем Handlebars
app.engine(
	'handlebars',
	engine({
		defaultLayout: 'main',
		extname: '.handlebars',
	})
)
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'src', 'views'))

// Логирование запросов
app.use((req, res, next) => {
	logger.info({
		message: 'HTTP Request received',
		method: req.method,
		url: req.url,
		user: { id: '123', name: 'Denis' },
	})

	next()
})

// Настраиваем маршруты
app.get('/', (req, res) => res.render('home'))
app.get('/about', (req, res) => {
	logger.info({
		message: 'HTTP Request received',
		method: req.method,
		url: req.url,
		user: { id: '123', name: 'Denis' },
	})

	res.render('about', { title: 'About', fortune: fortune.getFortune() })
})
app.get('*', (req, res) => {
	res.status(404)
	res.render('404')
})

// Логирование ошибок
app.use((err, req, res, next) => {
	logger.error({ message: 'Internal Server Error', error: err.message })
	res.status(500)
	res.render('500')
})

// Запуск сервера
app.listen(port, () => {
	logger.info(`Сервер запущен на http://localhost:${port}`)
})
