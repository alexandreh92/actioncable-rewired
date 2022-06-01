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

    // clean: {
    //   default: {
    //     script: series(
    //       'lerna exec "yarn start clean" --parallel --no-bail',
    //       'yarn start clean.self',
    //     ),
    //     description: 'Clean artifacts from all packages',
    //   },
    //   self: {
    //     script: rimraf('coverage lib reports'),
    //     hiddenFromHelp: true,
    //   },
    // },

    build: {
      default: {
        script: series(
          'lerna link',
          'lerna exec "yarn build" --ignore=sandbox --stream --no-bail',
        ),
        description: 'Builds all packages for production',
      },
    },

    dev: {
      default: {
        script: series(
          'lerna link',
          // 'yarn start clean',
          'lerna exec "yarn dev" --scope=sandbox --stream --no-bail',
          concurrent({
            packages: 'yarn start dev.packages',
          }),
        ),
        description: 'Builds all packages in "watch mode" and starts the docs',
      },

      packages: {
        script:
          'lerna exec "yarn build" --scope=actioncable-rewired --parallel --no-bail',
        hiddenFromHelp: true,
      },
    },

    //   docs: {
    //     script:
    //       'lerna exec "yarn start dev" --scope=@decisiv/dds-docs --stream --no-bail',
    //     hiddenFromHelp: true,
    //   },
    //   packages: {
    //     script:
    //       'lerna exec "yarn start dev" --ignore=@decisiv/dds-docs --parallel --no-bail',
    //     hiddenFromHelp: true,
    //   },
    //   sandbox: {
    //     script: 'lerna run start:sandbox --scope=@decisiv/sandbox',
    //   },
    // },

    // test: {
    //   default: {
    //     script: 'jest',
    //     description: 'Runs tests of all packages',
    //   },
    //   updateSnapshots: {
    //     script: 'jest -u',
    //     description: 'Updates all snapshots from jest',
    //   },
    //   openReport: {
    //     script: 'open-cli coverage/index.html',
    //     description: 'Opens the generated test coverage report',
    //   },
    // },

    // lint: 'lerna exec "yarn start lint" --parallel --no-bail',

    // ci: {
    //   default: {
    //     script: series(
    //       'yarn start clean',
    //       concurrent({
    //         lint: 'yarn start ci.lint',
    //         test: series('yarn start ci.build', 'yarn start ci.test'),
    //       }),
    //     ),
    //     description:
    //       'Cleans, builds and tests all packages, and finally uploads the test coverage report',
    //   },
    //   lint: oneLine`
    //     lerna exec
    //       'yarn start "lint
    //           --format junit
    //           -o $LERNA_ROOT_PATH/reports/lint-\${LERNA_PACKAGE_NAME#"@decisiv/"}/js-lint-results.xml"'
    //       --stream --no-bail --concurrency 1
    //   `,
    //   build: oneLine`
    //     lerna exec "yarn start build"
    //       --stream --no-bail
    //       --ignore @decisiv/dds-docs
    //       --ignore @decisiv/sandbox
    //   `,
    //   test: series(
    //     oneLine`
    //       lerna exec
    //         'JEST_JUNIT_OUTPUT_DIR="$LERNA_ROOT_PATH/reports/test-\${LERNA_PACKAGE_NAME#"@decisiv/"}/"
    //           yarn start "test
    //             --no-cache --maxWorkers=2
    //             --ci --coverage --reporters=jest-junit"'
    //         --stream --no-bail --concurrency 1
    //     `,
    //     'codecov',
    //   ),
    // },

    // deploy: {
    //   default: {
    //     script: series(
    //       'yarn start clean',
    //       'lerna exec "yarn start build" --stream --no-bail --ignore @decisiv/dds-docs',
    //       'yarn start deploy.modules',
    //     ),
    //     description: 'Build the NPM modules and deploy them to Gemfury',
    //   },
    //   modules: {
    //     script: 'SKIP_COMMITLINT=true npx lerna publish --yes',
    //     description: 'Deploy the NPM modules to Gemfury',
    //   },
    // },
  },
};
