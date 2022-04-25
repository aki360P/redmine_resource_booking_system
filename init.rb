require File.expand_path('../lib/rrbs_projects_helper_patch', __FILE__)

Redmine::Plugin.register :redmine_resource_booking_system do
  name 'Redmine Resource Booking System plugin'
  author 'QBurst, Tobias Droste, Akinori Iwasaki'
  description 'Provides a resource booking system with javascript fullcalendar'
  version '1.1.0'
  #requires_redmine version_or_higher: '2.5.0'
  url 'https://github.com/aki360P/redmine_resource_booking_system'
  
  
  project_module :redmine_resource_booking_system do
    permission :rrbs_booking, :rrbs_bookings => 'index'
    permission :rrbs_setting, :rrbs_settings => 'edit'
  end
  
  
  # add tab - project module
  menu :project_menu, :rrbs_bookings, {:controller => 'rrbs_bookings', :action => 'index' }, :caption => :label_rrbs_booking, :param => :project_id
  
  
end