/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('images', {
    id: 'id',
    imageurl: {
      type: 'varchar(1000)',
      notNull: true,
      default: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
      unique: true
    },
    source: {
      type: 'varchar(1000)',
      notNull: true,
      default: ''
    },
    category: {
      type: 'varchar(1000)',
      notNull: true,
      default: 'memes'
    },
    createdat: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  }, 
  {
    ifNotExists: true
  });
};

exports.down = (pgm) => {
  pgm.dropTable('images', {
    ifExists: true
  });
};
