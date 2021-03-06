'use strict';

const matches = require('express').Router();
const Match = require('mongoose').model('Match');
const User = require('mongoose').model('User');

const elo = require('../elo');

matches.get('/', async function (req, res) {
  const matches = await Match.find({}).exec();
  res.send(matches);
});

matches.post('/', async function (req, res) {
  try {
    const newMatch = req.body;

    const player1 = await User.findOne({username: newMatch.player1.username}).exec();
    const player2 = await User.findOne({username: newMatch.player2.username}).exec();

    if (!player1) {
      res.status(400).send('Player 1 not found');
      return;
    }

    if (!player2) {
      res.status(400).send('Player 2 not found');
      return;
    }

    if (player1.username === player2.username) {
      res.status(400).send('Player 1 and 2 can\'t be same');
      return;
    }

    if ('' + player1.pin !== newMatch.player1.pin) {
      res.status(400).send('Incorrect pin for Player 1');
      return;
    }

    if ('' + player2.pin !== newMatch.player2.pin) {
      res.status(400).send('Incorrect pin for Player 2');
      return;
    }

    if (newMatch.winner !== newMatch.player1.username &&
        newMatch.winner !== newMatch.player2.username) {
      res.status(400).send('Incorrect winner');
      return;
    }

    delete newMatch.player1.pin;
    delete newMatch.player2.pin;

    newMatch.player1.rating = player1.rating;
    newMatch.player2.rating = player2.rating;

    let winner, loser;
    if (newMatch.winner === player1.username) {
      winner = player1;
      loser = player2;
    } else {
      winner = player2;
      loser = player1;
    }

    const gains = elo(winner, loser);
    winner.rating += gains.winnerGain;
    loser.rating += gains.loserGain;
    winner.matches++;
    loser.matches++;
    winner.wins++;
    loser.losses++;

    newMatch.player1.ratingGain = player1.rating - newMatch.player1.rating;
    newMatch.player2.ratingGain = player2.rating - newMatch.player2.rating;

    await player1.save();
    await player2.save();

    const match = new Match(newMatch);
    await match.save();

    console.log('Added new match', newMatch);
    res.sendStatus(200);
  } catch (e) {
    console.log('error posting match', e);
    res.status(500).send(e.message);
  }
});

module.exports = matches;
