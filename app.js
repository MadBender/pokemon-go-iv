#! /usr/bin/env node
'use strict';
const process = require('process');
const PogoBuf = require("pogobuf");
const pad = require("pad");
const _ = require("lodash");
const pokemonNames = require("./pokemonNames.js");
const argv = require('minimist')(process.argv.slice(2));

if (argv.h || argv.help) {
  console.log('Usage: ');
  console.log('node app.js -u <username> -p <password> -a <ptc|google> [-s name|cp|hp|attack|defence|stamina|iv]');
  process.exit();
}

const username = argv.u;
const password = argv.p;

if (!username || !password) {
  console.error('Username and password required (-u and -p)');
  process.exit(1);
}

const provider = argv.a;
const sort = argv.s || 'iv';

const login = provider == "ptc"
  ? new PogoBuf.PTCLogin()
  : new PogoBuf.GoogleLogin()

//working
login.login(username, password)
  .then(token => {
    const client = new PogoBuf.Client();
    client.setAuthInfo(provider, token);
    client.init();
    return client.getInventory(0);
  })
  .then(resp => {
    //processing inventory
    const items = resp.inventory_delta.inventory_items;
    let pokemons = items.filter(
      item => item.inventory_item_data
        && item.inventory_item_data.pokemon_data
        && item.inventory_item_data.pokemon_data.pokemon_id
      )
      .map(item => {
        const p = item.inventory_item_data.pokemon_data;
        const res = {
          name: p.nickname || pokemonNames[p.pokemon_id] || "#" + p.pokemon_id,
          cp: p.cp,
          hp: p.stamina,
          attack: p.individual_attack || 0,
          defence: p.individual_defense || 0,
          stamina: p.individual_stamina || 0
        };
        res.iv = (res.attack + res.defence + res.stamina) / 45 * 100;
        return res;
      });

    pokemons = _.sortBy(pokemons, sort);    
    if (sort != "name") {
      //sorting in descending order so best pokemons will be at the top
      pokemons = pokemons.reverse();
    }

    //rendering
    console.log();
    const renderRow = (name, cp, hp, att, def, sta, iv) =>
      console.log(
        pad(name, 20)
        + pad(5, cp)
        + pad(5, hp)
        + pad(7, att)
        + pad(4, def)
        + pad(4, sta)
        + pad(9, iv)
      );

    renderRow("Name", "CP", "HP", "Att", "Def", "Sta", "IV");
    for (let p of pokemons) {
      renderRow(p.name, p.cp, p.hp, p.attack, p.defence, p.stamina, p.iv.toFixed(1));
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });