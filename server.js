let express = require('express')
let cors = require('cors')


const PORT = process.env.PORT || 1234


const { Client } = require('pg')
const client = new Client({
    host: '13.76.33.58',
    user: 'postgres',
    password: 'P@$$',
    database: 'TueKan',
    ssl: true,
    port: '5432'
})

client.connect()

let app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/api/user/login', (req, res) => {
    /*  ให้ ส่งข้อความอะไรสักอย่างหากเกิด status 40x */
    let { username, password } = req.body
    if (!(username && password)) {
        res.status(400).send("400 Not Found ")
        return
    }
    client.query('SELECT * FROM account WHERE username=$1', [username], (err, data) => {
        if (err) {
            res.status(401).send("401 Not Found 35")
        }
        else if (data.rows[0] == undefined) {
            res.status(401).send("401 Not Found 38")
        }
        else {
            if (data.rows[0]['password'] != password) {
                res.status(401).send("401 Not Found 42")
            }
            else {
                res.status(202).send("OK!")
            }
        }
    })

})

app.post('/api/user', (req, res) => {
    let { username, password } = req.body
    client.query('INSERT INTO account(username,password) VALUES ($1,$2)', [username, password],
        (err) => {
            if (err) {
                console.log(err.stack)
                //ส่งข้อความบอก error (อะไรก็ได้)
                res.status(406).send("ERROR! 59")
            } else {
                //ส่งข้อความบอกว่าสร้างบัญชีเสร็จแล้ว (อะไรก็ได้)
                res.status(201).send("SUCESSFUL! 62")
            }
        })

})

app.get('/api/posts', async (req, res) => {
    client.query(' SELECT * FROM post ', (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            let tosend = data.rows
            //ส่ง tosend ในรูปแบบ json กลับไป
            res.json(tosend)
        }
    })
})

app.post('/api/posts', (req, res) => {
    let { name, topic, content } = req.body
    client.query('INSERT INTO post(username,topic,content) VALUES ($1,$2,$3)', [name, topic, content],
        (err) => {
            if (err) {
                console.log(err.stack)
            }else{
                res.status(201).send(data.rows[0].id.toString())
            }
        })
})

app.get('/api/posts/:id', (req, res) => {
    let { id } = req.params
    let forsend;
    client.query('SELECT * FROM post WHERE id=$1', [id], (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            forsend = data.rows[0]
        }
    })
    client.query('SELECT * FROM comment WHERE post_id=$1', [id], (err, data) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(data.rows)
            let allcomment = { ...forsend, comment: [...data.rows] }
            //ส่ง allcomment กลับไป
            res.json(allcomment)
        }
    })
})

app.post('/api/posts/:id/reply', (req, res) => {
    let { id } = req.params
    let { name, reply } = req.body
    client.query('INSERT INTO comment(post_id,username,reply) VALUES ($1,$2,$3)', [id, name, reply],
        (err) => {
            if (err) {
                console.log(err.stack)
            }
        })
    res.status(202).send('Reply success')
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`)
})

