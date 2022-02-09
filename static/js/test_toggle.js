window['reporters_reporter_jira'] = {
    get_data: () => {
        if ($('#integration_checkbox_reporter_jira').prop('checked')) {
            const id = $('#selector_reporter_jira .selectpicker').val()
            return {id, ...jiraVm.body_data}
        }
    },
    set_data: data => {
        console.log('settings data for reporter_jira', data)
        const {id, ...rest} = data
        $('#integration_checkbox_reporter_jira').prop('checked', true)
        $('#selector_reporter_jira .selectpicker').val(id).selectpicker('refresh')
        $('#selector_reporter_jira').collapse('show')
        jiraVm.load(rest)
    },
    clear_data: () => {
        const selector = $('#selector_reporter_jira .selectpicker')
        selector[0]?.options.forEach(item =>
            $(item).attr('data-is_default') && $(selector[0]).val($(item).val()).selectpicker('refresh')
        )
        $('#integration_checkbox_reporter_jira').prop('checked', false)
        $('#selector_reporter_jira').collapse('hide')
        $('#settings_reporter_jira').collapse('hide')
        jiraVm.clear()
    },
    set_error: data => jiraVm.handleError(data),
    clear_errors: () => jiraVm.errors = jiraInitialState().errors
}

const jiraInitialState = () => ({
    fields: [],
    priority_mapping: {
        critical: 'blocker',
        high: 'major',
        medium: 'medium',
        low: 'minor',
        info: 'trivial'
    },
    limits: {
        max_description_size: '',
        max_comment_size: '',
    },
    dynamic_fields: [],
    separate_epic_linkage: false,
    use_another_jira: false,
    reopen_if_closed: false,

    errors: {},
})

const jiraApp = {
    delimiters: ['[[', ']]'],
    data() {
        return jiraInitialState()
    },
    template: `<div class="col-6 security_integration_item" data-name="reporter_jira" id="reporter_jira">
    <div class="card card-row-1">
        <div class="card-header">
            <div class="d-flex">
                <h9 class="flex-grow-1" style="line-height: 24px">Jira</h9>
                <button type="button" class="btn btn-24 btn-action" data-toggle="collapse"
                        data-target="#settings_reporter_jira" aria-expanded="false"><i class="fas fa-cog"></i>
                </button>
                <label class="custom-toggle">
                    <input type="checkbox" data-target="#selector_reporter_jira" aria-expanded="false"
                           data-toggle="collapse"
                           class="integration_checkbox" id="integration_checkbox_reporter_jira">
                    <span class="custom-toggle-slider rounded-circle"></span>
                </label>
            </div>
        </div>
        <div class="row">
            <div class="collapse col-12 mb-3 pl-0" id="selector_reporter_jira">
                <select class="selectpicker" data-style="btn-secondary">
                    <slot></slot>
                </select>
            </div>
        </div>
        <div class="row">
            <div class="collapse col-12 mb-3 p-0" id="settings_reporter_jira">
                <div class="row">
                    <h7>Advanced Settings</h7>
                </div>

                <div class="row mt-2">
                    <div class="col">
                        <h9>Jira fields</h9>
                        <p>
                            <h13>For all</h13>
                        </p>
                    </div>
                    <button class="btn btn-primary btn-37"
                            @click.prevent="add_jira_field"
                    ><i class="fa fa-plus"></i></button>
                </div>

                <div class="row">
                    <jira-field
                            v-for="(item, index) in fields"
                            v-model:field_key="item.key"
                            v-model:field_value="item.value"
                            :index="index"
                            @remove="removeJiraField"
                    ></jira-field>
                </div>

                <div class="row mt-2">
                    <div class="col-12 p-0">
                        <h9>Change priority mapping</h9>
                        <p>
                            <h13>Description</h13>
                        </p>
                    </div>
                    <div class="row">
                        <jira-priority-mapping
                                v-for="k in Object.keys(priority_mapping)"
                                :field_key="k"
                                v-model:field_value="priority_mapping[k]"
                        ></jira-priority-mapping>
                    </div>
                </div>

                <div class="row mt-2">
                    <div class="col-12 p-0">
                        <h9>Limits</h9>
                        <p>
                            <h13>Description</h13>
                        </p>
                    </div>
                    <div class="row col-12 p-0">
                        <div class="col">
                            <label>
                                <h9>Max description size</h9>
                                <input type="number" placeholder="Value"
                                       class="form-control form-control-alternative"
                                       v-model="limits.max_description_size"
                                       :class="{ 'is-invalid': errors.max_description_size }"
                                />
                                <div class="invalid-feedback">[[ errors.max_description_size ]]</div>
                            </label>

                        </div>
                        <div class="col">
                            <label>
                                <h9>Max comment size</h9>
                                <input type="number" placeholder="Value"
                                       class="form-control form-control-alternative"
                                       v-model="limits.max_comment_size"
                                       :class="{ 'is-invalid': errors.max_comment_size }"
                                />
                                <div class="invalid-feedback">[[ errors.max_comment_size ]]</div>
                            </label>
                        </div>
                    </div>
                </div>


                <div class="row mt-2">
                    <div class="col">
                        <h9>Dynamic fields</h9>
                        <p>
                            <h13>Description</h13>
                        </p>
                    </div>
                    <button class="btn btn-primary btn-37"
                            @click.prevent="add_dynamic_field"
                    ><i class="fa fa-plus"></i></button>
                </div>
                <div class="row">
                    <jira-dynamic-field
                            v-for="(item, index) in dynamic_fields"
                            v-model:field_condition="item.condition"
                            v-model:field_key="item.key"
                            v-model:field_value="item.value"
                            :index="index"
                            @remove="removeDynamicField"
                    ></jira-dynamic-field>
                </div>

                <div class="mt-3">

                    <div class="form-check">
                        <label>
                            <input type="checkbox" class="form-check-input"
                                   v-model="separate_epic_linkage"
                            >
                            <h9>Separate epic linkage</h9>
                        </label>
                    </div>

                    <div class="form-check">
                        <label>
                            <input type="checkbox" class="form-check-input"
                                   v-model="use_another_jira"
                            >
                            <h9>Use another jira</h9>
                        </label>
                    </div>

                    <div class="form-check">
                        <label>
                            <input type="checkbox" class="form-check-input"
                                   v-model="reopen_if_closed"
                            >
                            <h9>Reopen if closed</h9>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>`,
    computed: {
        body_data() {
            const data = { ...this.$data }
            delete data.errors
            data.fields = data.fields.filter(item => item.key !== '')
            data.dynamic_fields = data.dynamic_fields.filter(item => item.condition !== '')
            console.log('collected data:', data)
            return data
        }
    },
    methods: {
        clear() {
            Object.assign(this.$data, jiraInitialState())
        },
        removeJiraField(index) {
            this.fields.splice(index, 1)
        },
        add_jira_field() {
            this.fields.push({key: '', value: ''})
        },
        removeDynamicField(index) {
            this.dynamic_fields.splice(index, 1)
        },
        add_dynamic_field() {
            this.dynamic_fields.push({condition:'', key: '', value: ''})
        },
        load(data) {
            Object.assign(this.$data, {...jiraInitialState(), ...data})
        },
        handleError(data) {

            this.errors[data.loc[data.loc.length - 1]] = data.msg
            // console.log(data)
            // data.forEach(item => {
            //     console.log('item error', item)
            //     this.error[item.loc[item.loc.length]] = item.msg
            // })

        },
    },
}

const JiraField = {
    props: ['field_key', 'field_value', 'index'],
    emits: ['remove', 'update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="d-flex">
            <div class="col">
                <input type="text" placeholder="Key" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_key', $event.target.value)"
                    :value="field_key"
                    />
            </div>
            <div class="col">
                <input type="text" placeholder="Value" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_value', $event.target.value)"
                    :value="field_value"
                />
            </div>
            <div class="align-self-center">
                <button class="btn btn-primary btn-37" 
                    @click.prevent="$emit('remove', index)"
                >
                    <i class="fa fa-minus"></i>
                </button>
            </div>
        </div>
    `
}

const JiraPriorityMapping = {
    props: ['field_key', 'field_value'],
    emits: ['update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="col-6 p-0">
            <label class="mb-0">
                <h9 class="text-capitalize">[[ field_key ]]</h9>
                <input type="text" class="form-control form-control-alternative mt-1"
                       :placeholder="field_value"
                       :value="field_value"
                       @input="$emit('update:field_value', $event.target.value)"
                >
            </label>
        </div>
    `
}

const JiraDynamicField = {
    props: ['field_condition', 'field_key', 'field_value', 'index'],
    emits: ['remove', 'update:field_condition', 'update:field_key', 'update:field_value'],
    delimiters: ['[[', ']]'],
    template: `
        <div class="d-flex">
            <div class="col">
                <input type="text" placeholder="Condition" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_condition', $event.target.value)"
                    :value="field_condition"
                    />
            </div>
            <div class="col">
                <input type="text" placeholder="Key" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_key', $event.target.value)"
                    :value="field_key"
                    />
            </div>
            <div class="col">
                <input type="text" placeholder="Value" 
                    class="form-control form-control-alternative"
                    @input="$emit('update:field_value', $event.target.value)"
                    :value="field_value"
                />
            </div>
            <div class="align-self-center">
                <button class="btn btn-primary btn-37" 
                    @click.prevent="$emit('remove', index)"
                >
                    <i class="fa fa-minus"></i>
                </button>
            </div>
        </div>
    `
}

// jiraApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7'].includes(tag)
// const jiraVm = jiraApp.mount('#reporter_jira')
$.when(vueApp).then(() => {
    vueApp.component('JiraApp', jiraApp)
    vueApp.component('JiraField', JiraField)
    vueApp.component('JiraPriorityMapping', JiraPriorityMapping)
    vueApp.component('JiraDynamicField', JiraDynamicField)
})