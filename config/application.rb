require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Discolove
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    require 'es6_module_transpiler/rails'

    config.assets.precompile += ['vendor.js', 'preload-store.js.es6', 'ember_jquery.js']

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'UTC'

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = 'utf-8'

    # Our templates shouldn't start with 'discolove/templates'
    config.handlebars.templates_root = 'discolove/templates'
    config.handlebars.raw_template_namespace = "Ember.TEMPLATES"

  end
end
