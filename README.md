# xueqiu_reminder
Auto reminder you stock change status via email.

##HOW TO USE
copy config.example.js to config.js, modify it as you wish.

`node index.js`

OR

`./index.js`(make sure index.js has the privilege to be execute, try `chmod 755 index.js`)

OR (recommanded)

`sudo npm install -g pm2`
`pm2 start index.js`


pull code (master branch) to get the newest code. 
config.js has been gitignored so don't worry it may be overwriten or deleted.


you can open the feature 'remind me via SMS' on your email website(like 163.com), it's very cheap.
