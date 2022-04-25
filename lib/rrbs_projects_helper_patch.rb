require 'projects_helper'

module RrbsProjectsHelperPatch
    extend ActiveSupport::Concern

    def project_settings_tabs
      tabs = super
      return tabs unless @project.module_enabled?(:redmine_resource_booking_system)

      tabs.tap { |t| t << append_rrbs_tab }.compact
    end

    def append_rrbs_tab
      @rrbs_setting = RrbsSetting.find_or_create(@project.id)
      action = { name: 'rrbs_booking',
                 controller: 'rrbs_settings',
                 action: :edit,
                 partial: 'rrbs_settings/show', label: :label_rrbs_booking }
      return nil unless User.current.allowed_to?(action, @project)

      action
    end
end

ProjectsController.helper(RrbsProjectsHelperPatch)
