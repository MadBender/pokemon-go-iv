'use strict';

const PogoBuf = require("pogobuf");
const pokemonNames = require("./pokemonNames.js");

class Pokemon {
  constructor(auth) {
    this.auth = auth;
  }  

  connect() {
    const login = this.auth.provider == "ptc"
      ? new PogoBuf.PTCLogin()
      : new PogoBuf.GoogleLogin()
    const client = new PogoBuf.Client();

    return login.login(this.auth.username, this.auth.password)
      .then(token => {
        client.setAuthInfo(this.auth.provider, token);
        client.init();
        return client;
      });
  }

  static getIv(items) {
    const sortedItems = items.filter(
        item => item.inventory_item_data
          && item.inventory_item_data.pokemon_data
          && item.inventory_item_data.pokemon_data.pokemon_id
      )
      .map(item => {
        const p = item.inventory_item_data.pokemon_data;
        const res = {
          name: p.nickname || pokemonNames[p.pokemon_id] || "#" + p.pokemon_id,
          cp: p.cp,
          hp: p.hp,
          attack: p.individual_attack || 0,
          defence: p.individual_defense || 0,
          stamina: p.individual_stamina || 0          
        };
        res.iv = (res.attack + res.defence + res.stamina) / 45 * 100;
        return res;
      });    

    return sortedItems;
  }

  getInventory(client) {
    return client.getInventory(0)
      .then(resp => {
        return resp.inventory_delta.inventory_items;
      });
  }
}

module.exports = Pokemon;
