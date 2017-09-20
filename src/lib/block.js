const {BlockError} = require('../errors');
const CryptoJS = require('crypto-js');
const Joi = require('joi');
const {checkTransactions} = require('./transaction');

const blockSchema = Joi.object().keys({
  index: Joi.number(),
  prevHash: Joi.string().hex().length(64),
  time: Joi.number(),
  transactions: Joi.array(),
  nonce: Joi.number(),
  hash: Joi.string().hex().length(64),
});

/**
 * Validate block data
 *
 * @param block
 * @return {*}
 */
function isDataValid(block) {
  return Joi.validate(block, blockSchema);
}

/**
 * Verify block
 *
 * @param previousBlock
 * @param block
 * @param difficulty
 * @param unspent
 */
function checkBlock(previousBlock, block, difficulty, unspent) {
  if (! isDataValid(block)) throw new BlockError('Invalid block data');
  const blockDifficulty = getDifficulty(block.hash);
  if (previousBlock.index + 1 !== block.index) throw new BlockError('Invalid block index');
  if (previousBlock.hash !== block.prevHash) throw new BlockError('Invalid block prevhash');
  if (calculateHash(block) !== block.hash) throw new BlockError('Invalid block hash');
  if (blockDifficulty > difficulty) throw new BlockError('Invalid block difficulty');
  checkTransactions(block.transactions, unspent);
}

/**
 * Generate block hash
 *
 * @param block
 */
function calculateHash({index, prevHash, timestamp, transactions, nonce}) {
  return CryptoJS.SHA256(JSON.stringify({index, prevHash, timestamp, transactions, nonce})).toString();
}

/**
 * Create genesis block
 *
 * @return {{index: number, prevHash: string, timestamp: number, transactions: Array, nonce: number}}
 */
function makeGenesisBlock() {
  const block = {
    index: 0,
    prevHash: '0',
    timestamp: '1505759228',
    transactions: [],
    nonce: 0,
  };
  block.hash = calculateHash(block);

  return block;
}

/**
 * Get hash difficulty
 *
 * @param hash
 * @return {Number}
 */
function getDifficulty(hash) {
  return parseInt(hash.substring(0, 8), 16);
}


module.exports = {checkBlock, calculateHash, makeGenesisBlock, getDifficulty};
