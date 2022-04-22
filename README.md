[![Node.js CI](https://github.com/feyton/phantomBackend/actions/workflows/main.yml/badge.svg)](https://github.com/feyton/phantomBackend/actions/workflows/main.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/b8df2bf881e7a647a2c1/maintainability)](https://codeclimate.com/github/feyton/phantomBackend/maintainability)

### Inroduction

This is a backend project for a phantom app

### Contribution

-   Fabrice Hafashimana

### Running instructions
#### Requirements:
- Docker
- Node.js
- Browser
- Visual Studio Code
- Git and Gitbash (Github optional)
#### Assumptions:
- [ ] Basic knowledge of file system
- [ ] Basic understanding of git
- [ ] COmfortable working with terminal

> All commands write here perform no malcious actions and they are only bound to get you started with the project.
#### Steps:
Follow the following steps. **Note:** You can copy and paste these code in a terminal opened at you prefered folder (Windows)
1. Create an empty directory and git it a name (<phantom>)
2. Right click and open terminal at the location or change the working directory to that folder
3. Open and run docker demon. Check by running the following command `docker start --help` and check status
#### Steps:
The steps are in two stages. 
> Initial project initiation
```js
git clone https://github.com/feyton/phantomBacken .
git fetch origin
npm install
cp .env.sample .env.sample.copy
mv .env.sample.copy .env
docker run --name phantom-redis -p 8765:6379 -d redis
docker run --name phantom-db -e POSTGRES_USER=phantom -e POSTGRES_PASSWORD=1234 -p 6000:5432 -d postgres
npm run dev
open http://localhost:3000
// open the browser

```

> Testing new changes

```js
git fetch origin
git co master
npm install
docker start phantom-redis
docker start phantom-db
npm run dev
open http://localhost:3000
// Open the browser
```

### Acknwolegdements

None for now
