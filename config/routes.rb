Rails.application.routes.draw do
  resources :projects do
    resources :rrbs_bookings
    patch :rrbs_setting, path: '/settings/rrbs_booking', controller: 'rrbs_settings', action: :edit
  end
end