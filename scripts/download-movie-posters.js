const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Mapping des films avec leurs URLs d'affiches
const moviePosters = {
  'the-twits.jpg': 'https://media.themoviedb.org/t/p/original/izYZGeOHhPWiga8Hb5P4JYfcH8T.jpg',
  'watchmen-chapter-i.jpg': 'https://media.themoviedb.org/t/p/original/tE2vZ6HdlmKaBh0wpsvHCf7HJKo.jpg',
  'diplodocus.jpg': 'https://media.themoviedb.org/t/p/original/njpFUql3o18PUE0GspeUvAKdYsv.jpg',
  'les-bad-guys-2.jpg': 'https://media.themoviedb.org/t/p/original/1heUoLYAHVAKn0ehIF9ASOg2jUv.jpg',
  'mononoke-le-film-chapitre-ii.jpg': 'https://media.themoviedb.org/t/p/original/bT2qcTXVNUbeIMjbggB14Wyymgi.jpg',
  'the-seat.jpg': 'https://media.themoviedb.org/t/p/original/rrSRNADGugT1xy5g8nKBM2HJuwv.jpg',
  'ozi-la-voix-de-la-foret.jpg': 'https://media.themoviedb.org/t/p/original/mDFKl9psY7q3w1mag0SSq1ixIFu.jpg',
  'rebellious.jpg': 'https://media.themoviedb.org/t/p/original/kUAP8vw4Bklp9Z01H9K0k6iRihk.jpg',
  'pocahontas-une-legende-indienne.jpg': 'https://media.themoviedb.org/t/p/original/y7expGBz3w2o4up38M3mfGYQ0i0.jpg',
  'princesse-mononoke.jpg': 'https://www.themoviedb.org/t/p/original/AulQiyP2PMQKW5Vm7PviGrFbpPm.jpg',
  'gabby-et-la-maison-magique.jpg': 'https://media.themoviedb.org/t/p/original/AsHpAbkusQPgVwKG3Sm8p2A1rCV.jpg',
  'watchmen-les-gardiens-chapitre-ii.jpg': 'https://media.themoviedb.org/t/p/original/w95CBK77vAIM5YU6h717WyWopZb.jpg',
  '100-pourcent-loup.jpg': 'https://media.themoviedb.org/t/p/original/pzaQuKvFsL82kRkpHZWNaVeZqhf.jpg',
  'pocahontas-ii-un-monde-nouveau.jpg': 'https://media.themoviedb.org/t/p/original/jOE8yV1uTpGnDxNHyV9qVl43Yse.jpg',
  '200-pourcent-loup.jpg': 'https://media.themoviedb.org/t/p/original/6BYX0i2oFLMsCLekiUkWGNJsrO.jpg',
  'les-bad-guys.jpg': 'https://www.themoviedb.org/t/p/original/9NGa3c2CZp2dfYQLTmcFoVDFbOz.jpg',
  'lance-dur.jpg': 'https://i.imgur.com/RiFHqeT.png',
  'manu-payet-emmanuel-2.jpg': 'https://media.themoviedb.org/t/p/original/3SxuQs4XTZuseSxAfsFzuPMgOUA.jpg',
  'manu-payet-emmanuel.jpg': 'https://media.themoviedb.org/t/p/original/zPaziQDIM4b5FVQQYVmWP9qfLZ1.jpg',
  'pink-floyd-live-at-pompeii.jpg': 'https://media.themoviedb.org/t/p/original/bxjgbHH14nEMx3YtFDLJ04omQhH.jpg',
  'ahmed-sylla-origami.jpg': 'https://media.themoviedb.org/t/p/original/kobpDYZniBtfK4xL5GsXnvV5im2.jpg',
  'anthony-kavanagh-happy.jpg': 'https://media.themoviedb.org/t/p/original/gDkjmmtEQt4WpDajeQyPlCXUu0c.jpg',
  'haroun-seuls.jpg': 'https://i.imgur.com/XTjLZXP.png',
  'jake-paul-vs-mike-tyson.jpg': 'https://i.imgur.com/V860UQV.png',
  'mylene-farmer-nevermore.jpg': 'https://media.themoviedb.org/t/p/original/b7rplx2L3YUrRlxpwCmpsFBldD.jpg',
  'francois-xavier-demaison-divins.jpg': 'https://media.themoviedb.org/t/p/original/kL50nzYVG4iMORYDOTRqvxfmgzv.jpg',
  'coluche-cest-pour-rire.jpg': 'https://media.themoviedb.org/t/p/original/rwlrimIkxFBu7wrkt9JkveY7WK7.jpg',
  'florence-foresti-boys.jpg': 'https://media.themoviedb.org/t/p/original/rmyWQh2PtEV8QX0Du3p3K3QdbOB.jpg',
  'david-castello-lopes-authentique.jpg': 'https://media.themoviedb.org/t/p/original/cyYXjy9GSO7orkVqsKL1wLxLlTw.jpg',
  'anne-roumanoff-lexperience.jpg': 'https://media.themoviedb.org/t/p/original/hPW51lsM7DsL9GVdj68gDgrIwBT.jpg',
  'redouane-bougheraba-panier.jpg': 'https://i.imgur.com/Ehkldwe.png',
  'sch-jvlivs-tour.jpg': 'https://i.imgur.com/YgyLuaj.png',
  'veronique-gallo-femme-de-vie.jpg': 'https://media.themoviedb.org/t/p/original/1XcyqwLE2bnglL3OpTi3OUwWWyV.jpg',
  'rudolph-le-petit-renne.jpg': 'https://media.themoviedb.org/t/p/original/u5epea5ADbZIzeOv5bS0XPFKw51.jpg',
  'vaiana-la-legende.jpg': 'https://media.themoviedb.org/t/p/original/u9rrmuYW9jCmFn3zN0RX9vhzRKp.jpg',
  'les-indestructibles.jpg': 'https://media.themoviedb.org/t/p/original/1xnQ093qUPWOWZHBgw5oEUEcfTe.jpg',
  'pompo-the-cinephile.jpg': 'https://media.themoviedb.org/t/p/original/fzwYH3k6h8z7mMj4UkquPaflGS0.jpg',
  'wallace-et-gromit-pantalon.jpg': 'https://media.themoviedb.org/t/p/original/il1nrKu1ujuUhTK0GtCZXi5gCcF.jpg',
  'kiki-la-petite-sorciere.jpg': 'https://media.themoviedb.org/t/p/original/tdOJxx6PCzjPYViSnk0OPQ80X2d.jpg',
  'wallace-et-gromit-rase.jpg': 'https://media.themoviedb.org/t/p/original/sNCkVQcQkqhIeG9PlxP0qC9r5WJ.jpg',
  'silex-and-the-city.jpg': 'https://media.themoviedb.org/t/p/original/slkI1pFIlkeTQIcvs0s8JuFaNE0.jpg',
  'wallace-et-gromit-lapin-garou.jpg': 'https://media.themoviedb.org/t/p/original/x12w9DwDO1qNLvpx0llASLWj5dS.jpg',
  'croquette-le-chat.jpg': 'https://media.themoviedb.org/t/p/original/zmvGXy0ZJirydstehP7UzmR3nys.jpg',
  'simpsons-noel-hypnose.jpg': 'https://media.themoviedb.org/t/p/original/vzst9twmgGxKx0eBoqBHn8fc38e.jpg',
  'petit-panda-en-afrique.jpg': 'https://media.themoviedb.org/t/p/original/vJ8DcUTSwtvW0IX15faT9NXtki3.jpg',
  'geant-de-fer.jpg': 'https://media.themoviedb.org/t/p/original/1Z1Gn2bbyOygv8R2qE2uLjwualf.jpg',
  'haikyu-guerre-des-poubelles.jpg': 'https://media.themoviedb.org/t/p/original/vwE7e78QVIyoYxHA7FkHCdI9ugU.jpg',
  'wallace-et-gromit-excursion.jpg': 'https://media.themoviedb.org/t/p/original/ywO2s5STf9DgX1PEgH9q4d0E9CW.jpg',
  'le-grinch.jpg': 'https://media.themoviedb.org/t/p/original/36a2GG5L0QW7iP2g8OCYoAW9PJ.jpg',
  'wallace-et-gromit-vengeance.jpg': 'https://media.themoviedb.org/t/p/original/mf2LpP6YtmR8Kvl6bmQJleh8cB4.jpg',
  'goodbye-monster.jpg': 'https://media.themoviedb.org/t/p/original/gOZRQI5XJQewqoytPNV8LK17aqm.jpg',
  'predator-killer-of-killers.jpg': 'https://media.themoviedb.org/t/p/original/lIBtgpfiB92xNoB3Wa2ZtRtcyYP.jpg',
  'aventures-de-gamba.jpg': 'https://media.themoviedb.org/t/p/original/tCsgzqgemB30NvMLhsoIpCAVY3m.jpg',
  'my-hero-academia-you-are-next.jpg': 'https://media.themoviedb.org/t/p/original/s7FB4JpSwAfr1DzFopB42u2zt3v.jpg',
  'vic-le-viking.jpg': 'https://media.themoviedb.org/t/p/original/rphuuooNZRvLqJ8MDNf1D7c72nY.jpg',
  'apollo-10-un-demi.jpg': 'https://media.themoviedb.org/t/p/original/A55ta3nzxpDgkwzemB2gyDfsd6I.jpg',
  'inu-oh.jpg': 'https://media.themoviedb.org/t/p/original/jz0hMWEMprUYdhiRGXQ7PGQdgn.jpg',
  'attaque-des-titans-derniere-attaque.jpg': 'https://image.tmdb.org/t/p/original/3oL5SWl7tPqaretovPKw9x04CXh.jpg',
  'overlord-the-sacred-kingdom.jpg': 'https://media.themoviedb.org/t/p/original/jEvytxNa5mfW7VAUmDWsZtIdATc.jpg',
  'plus-precieuse-marchandises.jpg': 'https://media.themoviedb.org/t/p/original/x4rfIXtFMZxOuwkk5VEYojzslTb.jpg',
  'niko-le-petit-renne.jpg': 'https://media.themoviedb.org/t/p/original/usHEreS690qdzPiJrMHdQ35Cfjp.jpg',
  'lulu-est-un-rhinoceros.jpg': 'https://i.imgur.com/er2svB4.png',
  'vie-en-gros.jpg': 'https://media.themoviedb.org/t/p/original/lykDs68lPur8DxSZDhf2pavrFMQ.jpg',
  'totto-chan.jpg': 'https://media.themoviedb.org/t/p/original/16mbW8N4x6WO5z5a6Pxsr9Dp6cw.jpg',
  'green-snake.jpg': 'https://www.themoviedb.org/t/p/original/yJT7sEBA9ejfijAgTKU2jspOPkN.jpg',
  'retour-au-bercail.jpg': 'https://i.imgur.com/eclju0g.png',
  'robin-robin.jpg': 'https://www.themoviedb.org/t/p/original/n1xu4sJTiMQjVhWkSWFWotSqHcw.jpg',
  'encanto.jpg': 'https://www.themoviedb.org/t/p/original/75s7inwv1WHRuySyjA6p0oMaz9Z.jpg',
  'pil.jpg': 'https://www.themoviedb.org/t/p/original/mRblB0JaUEC9OZSu3yMyJ1CSSux.jpg',
  'a-working-man.jpg': 'https://media.themoviedb.org/t/p/original/6FRFIogh3zFnVWn7Z6zcYnIbRcX.jpg',
  'mufasa.jpg': 'https://media.themoviedb.org/t/p/original/67BPUqGcMK4iG97JNNX4GE0sDwo.jpg',
  'novocaine.jpg': 'https://media.themoviedb.org/t/p/original/27UdEf3BguQKPBPlYqHeWzOK2qr.jpg',
  'the-electric-state.jpg': 'https://i.imgur.com/QGXuuuj.png',
  'sonic-3.jpg': 'https://media.themoviedb.org/t/p/original/gERwLGTa6JGN4qXjkip13eDaxy1.jpg',
  'kraven-the-hunter.jpg': 'https://media.themoviedb.org/t/p/original/1GvBhRxY6MELDfxFrete6BNhBB5.jpg',
  'blanche-neige.jpg': 'https://media.themoviedb.org/t/p/original/3ovGhmdDJgSxwN41mFYR7jwxWOV.jpg',
  'vol-a-haut-risque.jpg': 'https://media.themoviedb.org/t/p/original/vWoa8QSoNwIHMBKLLv82btw2S5L.jpg',
  'un-parfait-inconnu.jpg': 'https://media.themoviedb.org/t/p/original/zN0SOrHKLWDOg2UuGmVA7ZKtLne.jpg',
  'monsieur-aznavour.jpg': 'https://media.themoviedb.org/t/p/original/23FkaTaAosaTcTgyuJdTf7TvcJu.jpg',
  'the-monkey.jpg': 'https://media.themoviedb.org/t/p/original/hjXIg0WFAR8YIdh2rnTLOOvw173.jpg',
  'nosferatu.jpg': 'https://media.themoviedb.org/t/p/original/8qCijVB6gYi25UbsEPuutbBIfD.jpg',
  'vaiana-2.jpg': 'https://media.themoviedb.org/t/p/original/usdwoEwm68cdeMOvGFPwSk9nLTr.jpg',
  'mickey-17.jpg': 'https://media.themoviedb.org/t/p/original/un8ckVxquKst5EXMaB765FjYJ6d.jpg',
  'captain-america-brave-new-world.jpg': 'https://media.themoviedb.org/t/p/original/4YFyYcUPfrbpj6VpgWh7xoUnwLA.jpg',
  'paddington-au-perou.jpg': 'https://media.themoviedb.org/t/p/original/Q2e1sXd3M7F3nfrpZIXy9zQ2vL.jpg',
  'criminal-squad-pantera.jpg': 'https://media.themoviedb.org/t/p/original/mq6Ra2oXRKapp5FCfgPJ3AwKigX.jpg',
  'better-man.jpg': 'https://media.themoviedb.org/t/p/original/i5mwFI8FutZKnbcQWKGJMEJvtqa.jpg',
  'bridget-jones-folle.jpg': 'https://media.themoviedb.org/t/p/original/17skglkX7rRDayZyFW1YotbUk5H.jpg',
  'jure-numero-2.jpg': 'https://media.themoviedb.org/t/p/original/c18uMLBc89qmJNw9emLUhFEku2b.jpg',
  'joker-folie-a-deux.jpg': 'https://media.themoviedb.org/t/p/original/cWJGZAozNQFKLCD8vv4ukw4nJP8.jpg',
  'deadpool-et-wolverine.jpg': 'https://media.themoviedb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  'blink-twice.jpg': 'https://media.themoviedb.org/t/p/original/51LUuruLaoe9JXit5hJD3qtpWTm.jpg',
  'napoleon-version-longue.jpg': 'https://media.themoviedb.org/t/p/original/lnCoPFCcg6vRv8M2RbNotUkEMAN.jpg',
  'wolfs.jpg': 'https://media.themoviedb.org/t/p/original/h75MpBXj3FcDu04Ha98bg0aJDqY.jpg',
  'vice-versa-2.jpg': 'https://media.themoviedb.org/t/p/original/eHUWo4AiomQwG8EpWhvNNA1RMYz.jpg',
  'gladiator-ii.jpg': 'https://media.themoviedb.org/t/p/original/7R1EXkBAKunoG0UhZToFrnlStcp.jpg',
  'robot-sauvage.jpg': 'https://media.themoviedb.org/t/p/original/konfEfTF9jA7GMNCd6mFAKXGzsB.jpg',
  'alien-romulus.jpg': 'https://media.themoviedb.org/t/p/original/xmDypImhT0OOloQIj3JLslUrBw8.jpg',
  'venom-the-last-dance.jpg': 'https://media.themoviedb.org/t/p/original/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
  'megalopolis.jpg': 'https://media.themoviedb.org/t/p/original/h09LlFWnp3oeALKw2yJwThj2xua.jpg',
  'smile-2.jpg': 'https://media.themoviedb.org/t/p/original/bZQweCDilXNvF8KuaEHcghM3Nwf.jpg',
  'lee-miller.jpg': 'https://media.themoviedb.org/t/p/original/sDMERGnOuRqBtBSTH3p5XGtkrUn.jpg',
  'comte-de-monte-cristo.jpg': 'https://media.themoviedb.org/t/p/original/bHd2ry2KYR109dl87agYQ2nCsnR.jpg',
  'beetlejuice-beetlejuice.jpg': 'https://media.themoviedb.org/t/p/original/4M8fnQF821aVFBbhLdTQGf4j4W9.jpg',
  'wicked.jpg': 'https://media.themoviedb.org/t/p/original/kQkgPhj6sCuoMWzPKWQVOWUXzib.jpg',
  'conclave.jpg': 'https://media.themoviedb.org/t/p/original/A6MSwpe963WmbNiOoAyBe7kn3Pa.jpg',
  'shang-chi.jpg': 'https://www.themoviedb.org/t/p/original/rHcCQVVnHVXWKTYRW5IFrigcKX8.jpg',
  'american-nightmare-5.jpg': 'https://www.themoviedb.org/t/p/original/a3A8OK9xGYmv7ISjycLDza0pO6B.jpg',
  'spirale.jpg': 'https://i.imgur.com/lGhrKxq.jpg',
  'the-batman.jpg': 'https://www.themoviedb.org/t/p/original/8gVy5MLXtZBWghMykQtPMsNc5kH.jpg',
  'free-guy.jpg': 'https://www.themoviedb.org/t/p/original/lG7Rv88OANLVbeR6Zymlid1cRuk.jpg',
  'the-northman.jpg': 'https://www.themoviedb.org/t/p/original/hk0JZyTHfgN35f43pJUhDPTNjM0.jpg',
  'doctor-strange-multiverse.jpg': 'https://www.themoviedb.org/t/p/original/dbJDPJBHKxnMyvcc12mcbGK5RPF.jpg',
  'infinite.jpg': 'https://www.themoviedb.org/t/p/original/bElBmTJSE1XGnLbSByThQAFzDWq.jpg',
  'ambulance.jpg': 'https://www.themoviedb.org/t/p/original/bvFeEZ10Gtt5Yd2KKDOTaO4m8v7.jpg',
  'kings-man-premiere-mission.jpg': 'https://www.themoviedb.org/t/p/original/tENLxofTH3ZiJyaqfVH37oQaFez.jpg',
  'jungle-cruise.jpg': 'https://www.themoviedb.org/t/p/original/82FgAW1yOtIWksHAHq2pi4OVkHW.jpg',
  'baby-boss-2.jpg': 'https://www.themoviedb.org/t/p/original/q7UGnFFUeJbf7R6CT1mMRTDCXI1.jpg',
  'morbius.jpg': 'https://www.themoviedb.org/t/p/original/xBoIe0eX9UuSSPe5Qt6KXIQOd3I.jpg',
  'dernier-duel.jpg': 'https://www.themoviedb.org/t/p/original/b69kfBhuztkodJfWe9qHx7Gjwe1.jpg',
  'dune.jpg': 'https://www.themoviedb.org/t/p/original/qpyaW4xUPeIiYA5ckg5zAZFHvsb.jpg',
  'reminiscence.jpg': 'https://www.themoviedb.org/t/p/original/mApajQEvFDpabw88IrR8VZnHjIY.jpg',
  'animaux-fantastiques-secrets-dumbledore.jpg': 'https://www.themoviedb.org/t/p/original/uXs7wMtsfnBFuGVogAxJXZXshFU.jpg',
  'malik-bentalha-encore.jpg': 'https://www.themoviedb.org/t/p/original/fRB9jIyCbr2oekoPlyBdQYOi2Un.jpg',
  'dieudonne-divorce-patrick.jpg': 'https://www.themoviedb.org/t/p/original/f8T9R2naiYd7rf7boA9WswG2zvP.jpg',
  'dieudonne-rendez-nous-jesus.jpg': 'https://www.themoviedb.org/t/p/original/9F70p5hHjlhGeYLCfAmo7tGHlFo.jpg',
  'y-a-t-il-un-flic-pour-sauver-le-monde.jpg': 'https://media.themoviedb.org/t/p/original/iCT7jC3zLvXVOugiVZPDuWuItjz.jpg',
  'superman.jpg': 'https://media.themoviedb.org/t/p/original/l5nirUStSC5k5eignnyWgknHftS.jpg',
  'thunderbolts.jpg': 'https://media.themoviedb.org/t/p/original/fJjszpbeLw6N2pglk3zYZjvzSTS.jpg',
  'sinners.jpg': 'https://media.themoviedb.org/t/p/original/8ajzjwKjHQKTicaGGM0t0tpco1j.jpg',
  'lilo-stitch.jpg': 'https://media.themoviedb.org/t/p/original/tUae3mefrDVTgm5mRzqWnZK6fOP.jpg',
  'the-amateur.jpg': 'https://media.themoviedb.org/t/p/original/g0ioLUEfBbwzmV3imZb4JTm6G61.jpg',
  'les-4-fantastiques.jpg': 'https://media.themoviedb.org/t/p/original/2REHnvEBsPA121X4Fi8dvGaYJ4o.jpg',
  '28-ans-plus-tard.jpg': 'https://media.themoviedb.org/t/p/original/3ACUg2j2ZsgrwT1RnaBmni8mOuI.jpg',
  'dragons.jpg': 'https://media.themoviedb.org/t/p/original/36ayHS6mrm7CdaiRq53eNNDrZeD.jpg',
  'ballerina.jpg': 'https://media.themoviedb.org/t/p/original/e7zUVzux574daVsOlbcvmqEieyn.jpg',
  'nobody-2.jpg': 'https://media.themoviedb.org/t/p/original/gmyEMJqpScyALufAMspejI6qGQx.jpg',
  'karate-kid-legends.jpg': 'https://media.themoviedb.org/t/p/original/sdl2dt1rZaTXMaYzIAaajOI0VPB.jpg',
  'evanouis.jpg': 'https://media.themoviedb.org/t/p/original/l5lipwrItOJQmockT57No63EPPy.jpg',
};

const postersDir = path.join(__dirname, '..', 'public', 'images', 'movies');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const filepath = path.join(postersDir, filename);
    
    // Vérifier si le fichier existe déjà
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${filename} already exists`);
      resolve();
      return;
    }

    console.log(`Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filename).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        console.error(`✗ Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      console.error(`✗ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Starting download of movie posters...\n');
  const entries = Object.entries(moviePosters);
  
  for (const [filename, url] of entries) {
    try {
      await downloadImage(url, filename);
      // Petite pause pour ne pas surcharger les serveurs
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download ${filename}`);
    }
  }
  
  console.log('\nDone!');
}

downloadAll();

