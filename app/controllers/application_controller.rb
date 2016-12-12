class ApplicationController < ActionController::Base

  protect_from_forgery with: :exception

  layout :set_layout

  def use_crawler_layout?
    # @use_crawler_layout ||= (has_escaped_fragment? || CrawlerDetection.crawler?(request.user_agent) || params.key?("print"))
    false
  end

  def set_layout
    use_crawler_layout? ? 'crawler' : 'application'
  end

  def no_cookies
    # do your best to ensure response has no cookies
    # longer term we may want to push this into middleware
    headers.delete 'Set-Cookie'
    request.session_options[:skip] = true
  end

end
