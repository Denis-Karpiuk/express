const fortuneCookies = [
	'Победи свои страхи, или они победят тебя.',
	'Скоро ты увидишь счастье.',
	'Впереди тебя ждет счастье.',
]

exports.getFortune = () => {
	const index = Math.floor(Math.random() * fortuneCookies.length)
	return fortuneCookies[index]
}
