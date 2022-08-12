const {
  concurrent,
  series,
  commonTags: { oneLine },
  rimraf,
} = require('nps-utils');

module.exports = {
  scripts: {
    default: {
      script: series(
        'yarn start build',
        'lerna exec "yarn dev" --scope=sandbox --stream --no-bail',
      ),
      description: 'Builds all packages for production and starts the docs',
    },

    clean: {
      default: {
        script: series('lerna exec "yarn start clean" --parallel --no-bail'),
        description: 'Clean artifacts from all packages',
      },
    },

    build: {
      default: {
        script: series(
          'lerna link',
          'lerna exec "yarn tsc && yarn vite build" --ignore=sandbox --stream --no-bail',
        ),
        description: 'Builds all packages for production',
      },

      watch: {
        script: series(
          'lerna link',
          'lerna exec "yarn tsc && yarn vite build -w" --ignore=sandbox --stream --no-bail',
        ),
        description: 'Builds all package in watch mode',
      },
    },

    dev: {
      default: {
        script: series(
          'lerna clean',
          'lerna link',
          concurrent({
            packages: 'yarn start dev.packages',
            sandbox: 'yarn start dev.sandbox',
          }),
        ),
        description: 'Builds all packages in "watch mode" and starts the docs',
      },

      sandbox: {
        script: 'lerna exec "yarn dev" --scope=sandbox --parallel --no-bail',
      },

      packages: {
        script: series(
          'lerna exec "nps build.watch" --ignore=sandbox --parallel --no-bail',
        ),
      },
    },

    version: {
      default: {
        script: 'yarn lerna version --no-private --yes',
        description: 'Bumps new version',
      },

      major: {
        script: 'yarn lerna version major --no-private --yes',
      },

      minor: {
        script: 'yarn lerna version minor --no-private --yes',
      },

      patch: {
        script: 'yarn lerna version patch --no-private --yes',
      },

      prerelease: {
        script: 'yarn lerna version prerelease --no-private --yes',
      },
    },
  },
};
