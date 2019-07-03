workflow "build, test and publish beta" {
  on = "push"
  resolves = "publish beta"
}

action "filter not tag" {
  uses = "actions/bin/filter@master"
  args = "not tag"
}

action "install" {
  needs = "filter not tag"
  uses = "actions/npm@master"
  args = "ci"
}

action "build" {
  needs = "install"
  uses = "actions/npm@master"
  args = "run build"
}

action "test" {
  needs = "install"
  uses = "actions/npm@master"
  args = "test"
}

action "filter branch master" {
  needs = ["build", "test"]
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "publish beta" {
  needs = "filter branch master"
  uses = "actions/npm@master"
  args = "run push-beta"
  secrets = ["GITHUB_TOKEN", "GH_USER", "GH_EMAIL"]
}

### Production

workflow "build, test and publish production" {
  on = "push"
  resolves = "publish production"
}

action "check for new tag" {
  uses = "actions/bin/filter@master"
  args = "tag"
}

action "install-prod" {
  needs = "check for new tag"
  uses = "actions/npm@master"
  args = "install"
}

action "build-prod" {
  needs = "install-prod"
  uses = "actions/npm@master"
  args = "run build"
}

action "test-prod" {
  needs = "install-prod"
  uses = "actions/npm@master"
  args = "test"
}

action "publish production" {
  needs = ["build-prod", "test-prod"]
  uses = "actions/npm@master"
  args = "run push-production"
  secrets = ["GITHUB_TOKEN", "GH_USER", "GH_EMAIL"]
}