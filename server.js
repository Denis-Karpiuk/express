const express = require('express')
const { engine } = require('express-handlebars')
const path = require('path')

const fortune = require('./src/lib/fortune')

const app = express()
const port = process.env.PORT || 3000

app.engine(
	'handlebars',
	engine({
		defaultLayout: 'main',
		extname: '.handlebars',
	})
)
// изменения из mian
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'src', 'views'))

app.get('/', (req, res) => res.render('home'))
app.get('/about', (req, res) =>
	// изменения из mian

	// изменения из mian

	// изменения из mian

	// изменения из mian
	res.render('about', { title: 'About', fortune: fortune.getFortune() })
)

app.get('*', (req, res) => {
	res.status(404)
	res.render('404')
})

app.use((err, req, res, next) => {
	res.status(500)
	res.render('500')
})

// add comment
app.listen(port, () =>
	console.log(`Сервер запущен на http://localhost:${port}`)
)
