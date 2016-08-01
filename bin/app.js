#! /usr/bin/env node
'use strict';
const fs = require('fs');
const process = require('process');

const argv = require('minimist')(process.argv.slice(2));
const Pokemon = require('../app.js');

if (argv.h || argv.help) {
  console.log('Usage: ');
  console.log('pokemon-go-iv -u <username> -p <password> -a ptc|google [-s time|iv] [--cache]');
  process.exit();
}

const username = argv.u;
const password = argv.p;

if (!username || !password) {
  console.error('Username and password required (-u and -p)');
  process.exit(1);
}

const provider = argv.a;
const sort = argv.s || 'time';

const getItems = () => {
  const pokemon = new Pokemon({username, password, provider});

  return pokemon
    .connect()
    .then(client => pokemon.getInventory(client));    
};

getItems().then((items) => {
  const sortedIvs = Pokemon.getIv(items);

  console.log(JSON.stringify(sortedIvs, null, 2));
  process.exit();
}).catch((err) => {
  console.error(err);
  process.exit(1);
})
