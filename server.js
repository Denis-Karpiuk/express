const express = require('express')
const { engine } = require('express-handlebars')
const path = require('path')
const logger = require('./logger')
const fortune = require('./src/lib/fortune')
const bodyParser = require('body-parser')
const multiparty = require('multiparty')
const fs = require('fs')
const pdfParse = require('pdf-parse')

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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Настраиваем маршруты
app.get('/', (req, res) => res.render('home'))

app.get('/about', (req, res) => {
	logger.info({
		message: 'HTTP Request received',
		method: req.method,
		url: req.url,
		user: { id: '123', name: 'Denis' },
	})

	res.render('about', {
		title: 'About',
		fortune: fortune.getFortune(),
	})
})

app.get('/download', (_, res) => {
	res.attachment('example.txt')
	res.send('Это содержимое файла.')
})

app.get('/upload', (_, res) => {
	res.render('upload')
})

app.post('/upload', async (req, res) => {
	const form = new multiparty.Form()

	form.parse(req, async (err, fields, files) => {
		if (err) {
			return res.status(500).send('Ошибка загрузки файла')
		}

		const file = files.files[0]
		const filePath = file.path

		try {
			const dataBuffer = fs.readFileSync(filePath)
			const pdfData = await pdfParse(dataBuffer)

			const pattern =
				/(Оплата по окладу)(\d{2}\.\d{4})([\d\s,]+)(\d+).*?(Подоходный налог)(\d{2}\.\d{4})([\d\s,]+).*?(Пенсионный фонд)(\d{2}\.\d{4})([\d\s,]+).*?(Аванс)(\d{2}\.\d{4})([\d\s,]+).*?К выдаче:\s*([\d\s,]+)/s

			const match = pdfData.text.match(pattern)

			if (match) {
				const result = {
					salaryPayment: {
						name: match[1],
						period: match[2],
						amount: parseAmount(match[3].trim().slice(0, -1)),
					},
					incomeTax: {
						name: match[5],
						period: match[6],
						amount: parseAmount(match[7].trim()),
					},
					pensionFund: {
						name: match[8],
						period: match[9],
						amount: parseAmount(match[10].trim()),
					},
					advance: {
						name: match[11],
						period: match[12],
						amount: parseAmount(match[13].trim()),
					},
					toPay: {
						name: 'К выдаче',
						amount: parseAmount(match[14].trim()),
					},
				}

				const response = await fetch(
					`https://api.nbrb.by/exrates/rates/431?ondate=${convertDate(
						match[2]
					)}`
				)

				if (!response.ok) {
					throw new Error(`Ошибка HTTP: ${response.status}`)
				}

				const data = await response.json()

				const salaryAsUsd =
					(result.advance.amount + result.toPay.amount) /
					data.Cur_OfficialRate

				res.render('salary', {
					month: match[2],
					usd: data.Cur_OfficialRate,
					date: convertDate(match[2], true),
					salary: salaryAsUsd.toFixed(),
					surplus: 2700 - salaryAsUsd.toFixed(),
				})
			} else {
				console.log('Совпадений не найдено')
			}
		} catch (error) {
			console.error('Ошибка обработки PDF:', error)
			res.status(500).send('Ошибка обработки PDF')
		}
	})
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

function convertDate(inputDate, revert = false) {
	const [month, year] = inputDate.split('.')
	const formattedMonth = month.padStart(2, '0')
	return revert
		? `30.${formattedMonth}.${year}`
		: `${year}-${formattedMonth}-30`
}

function parseAmount(str) {
	return parseFloat(str.replace(/\s/g, '').replace(',', '.'))
}
