Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get "stylesheets/:name.css" => "stylesheets#show", constraints: { name: /[a-z0-9_]+/ }
  get "/" => "home#index"
end
