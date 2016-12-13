require 'discolove_iife'

Rails.application.config.assets.configure do |env|
  env.register_preprocessor('application/javascript', DiscoloveIIFE)

  unless Rails.env.production? || ENV["DISABLE_EVAL"]
    require 'source_url'
    env.register_postprocessor('application/javascript', SourceURL)
  end
end