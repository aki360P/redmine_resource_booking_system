class RrbsSetting < ActiveRecord::Base
  include Redmine::SafeAttributes
  belongs_to :project

  validates_uniqueness_of :project_id
  validates :project_id, presence: true
  

  def self.find_or_create(project_id)
    rrbs_setting = RrbsSetting.where(['project_id = ?', project_id]).first
    puts ' ====================== '
    
    unless rrbs_setting.present?
      rrbs_setting = RrbsSetting.new()
      rrbs_setting.attributes = { project_id: project_id }
      
      # Set default
      rrbs_setting.attributes = { tracker_id: '1'}
      rrbs_setting.attributes = { custom_field_id_room: '1' }
      rrbs_setting.attributes = { custom_field_id_start: '2' }
      rrbs_setting.attributes = { custom_field_id_end: '3' }
      rrbs_setting.attributes = { custom_field_id_text: '4' }
      rrbs_setting.attributes = { issue_status_id_book: '1' }
      rrbs_setting.attributes = { issue_status_id_progress: '2' }
      rrbs_setting.attributes = { issue_status_id_complete: '3' }
      rrbs_setting.attributes = { issue_status_id_cancel: '4' }
      rrbs_setting.attributes = { footer_message: '' }
            
      rrbs_setting.save!
    end
    rrbs_setting
  end

end
