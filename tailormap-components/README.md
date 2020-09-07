# TailorMap Components

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.2.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. Use this in conjunction with a TailorMap viewer opening an app in debug mode.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Coding standards

### Automatically unsubcribing from subscriptions

You must make sure you unsubscribe from "infinite" subscriptions when your component, service or other thing gets destroyed. In this project we use [ngneat/until-destroy](https://github.com/ngneat/until-destroy). Make sure you use `untilDestroyed(this)` as the final operator in the pipe, see the article [RxJS: Avoiding takeUntil Leaks](https://ncjamieson.com/avoiding-takeuntil-leaks/).
