module.exports = {
  '**/*.{ts,tsx}': ['prettier --write', 'yarn lint:fix'],
  '**/*.{json,md,yml,yaml}': ['prettier --write'],
};
