
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/app.component.ts',
    'src/app/core/**/*.ts',
    'src/app/pages/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/core/models/**/*.ts',
    '!src/app/core/service/user-mock.service.ts',
    '!src/app/shared/**/*.ts',
    '!src/app/app.routes.ts',
    '!src/app/app.config.ts',
  ],
  coverageReporters: ['html', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    }
  }
};
