const random = require("random");

const natures = [
  "Hardy (+Atk/-Atk)",
  "Bold (+Def/-Atk)",
  "Modest (+spAtk/-Atk)",
  "Calm (+spDef/-Atk)",
  "Timid (+spd/-Atk)",
  "Lonely (+Atk/-Def)",
  "Docile (+Def/-Def)",
  "Mild (+spAtk/-Def)",
  "Gentle (+spDef/-Def)",
  "Hasty (+spd/-Def)",
  "Adamant (+Atk/-spAtk)",
  "Impish (+Def/-spAtk)",
  "Bashful (+spAtk/-spAtk)",
  "Careful (+spDef/-spAtk)",
  "Jolly (+spd/-spAtk)",
  "Naughty (+Atk/-spDef)",
  "Lax (+Def/-spDef)",
  "Rash (+spAtk/-spDef)",
  "Quirky (+spDef/-spDef)",
  "Naive (+spd/-spDef)",
  "Brave (+Atk/-spd)",
  "Relaxed (+Def/-spd)",
  "Quiet (+spAtk/-spd)",
  "Sassy (+spDef/-spd)",
  "Serious (+spd/-spd)",
];

function handler(twitch_client, channel_name) {
  let hp_iv = String(random.int(0, 31));
  let Atk_iv = String(random.int(0, 31));
  let Def_iv = String(random.int(0, 31));
  let spAtk_iv = String(random.int(0, 31));
  let spDef_iv = String(random.int(0, 31));
  let spd_iv = String(random.int(0, 31));

  let nature = natures[random.int(0, natures.length - 1)];

  let output_string =
    "Hp: " +
    hp_iv +
    " | Atk: " +
    Atk_iv +
    " | Def: " +
    Def_iv +
    " | spAtk: " +
    spAtk_iv +
    " | spDef: " +
    spDef_iv +
    " | spd: " +
    spd_iv +
    " | " +
    nature;

  twitch_client.say(channel_name, output_string);
  return;
}

module.exports = { handler };
