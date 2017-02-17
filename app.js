#! /usr/bin/env node
'use strict';

const process = require('process');
const argv = require('minimist')(process.argv.slice(2));
const PogoBuf = require("pogobuf");
const _ = require("lodash");
const pokemonNames = require("./pokemonNames.js");
const levelMultipliers = require("./levelMultipliers.js");
const render = require("./render.js");

if (argv.h || argv.help) {
    console.log('Usage: ');
    console.log('node app.js -u <username> -p <password> -a <ptc|google>');
    process.exit();
}

const username = argv.u;
const password = argv.p;

if (!username || !password) {
    console.error('Username and password required (-u and -p)');
    process.exit(1);
}

const provider = argv.a;

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
                    pokemonId: p.pokemon_id,
                    name: p.nickname || pokemonNames[p.pokemon_id] || "#" + p.pokemon_id,
                    timestamp: new Date(p.creation_time_ms),
                    cp: p.cp,
                    hp: p.stamina,
                    maxHp: p.stamina_max,
                    attack: p.individual_attack || 0,
                    defence: p.individual_defense || 0,
                    stamina: p.individual_stamina || 0,
                    quickMove: p.move_1,
                    chargeMove: p.move_2,
                    buddyDistance: p.buddy_total_km_walked,
                    gender: p.pokemon_display.gender
                };                

                const cpMult = p.cp_multiplier + p.additional_cp_multiplier;
                const levelMult = levelMultipliers.find(m => Math.abs(m.multiplier - cpMult) < 1e-4);
                if (levelMult) {
                    res.level = levelMult.level;
                }
                res.iv = (res.attack + res.defence + res.stamina) / 45 * 100;
                return res;
            });
        pokemons = _.orderBy(pokemons, ["pokemonId", "cp"], ["asc", "desc"]);

        render(pokemons);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });