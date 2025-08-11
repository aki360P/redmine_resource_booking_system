class RrbsSettingsController < ApplicationController
  #unloadable
  before_action :require_login
  before_action :find_user, :find_project, :authorize

  def initialize
    super()    #redmine�̈�ʕ�(body�ȊO)���p��
  end

  
  def edit
    unless params[:settings].nil?
      rrbs_setting = RrbsSetting.find_or_create(@project.id)
      
      rrbs_setting.update(rrbs_setting_params)
      rrbs_setting.save
      flash[:notice] = l(:notice_successful_update)
      redirect_to controller: 'projects',
                  action: 'settings', id: @project, tab: 'rrbs_booking'
    end
    
  end
  
  def show
    
  end
  
  

  private

  def find_user
    @user = User.current
  end

  def find_project
    @project = Project.find(params[:project_id])
  rescue ActiveRecord::RecordNotFound
    render_404
  end
  
  def rrbs_setting_params
    params.require(:settings).permit('tracker_id', 'custom_field_id_room', 'custom_field_id_start', 'custom_field_id_end', 'custom_field_id_text', 'issue_status_id_book', 'issue_status_id_progress', 'issue_status_id_complete', 'issue_status_id_cancel','footer_message')
  end
end
