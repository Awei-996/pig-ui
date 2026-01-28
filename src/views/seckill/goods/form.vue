<template>
	<el-dialog
		:title="state.ruleForm.id ? $t('common.editBtn') : $t('common.addBtn')"
		width="800px"
		v-model="visible"
		:close-on-click-modal="false"
		draggable
	>
		<el-form ref="goodsDialogFormRef" :model="state.ruleForm" :rules="dataRules" label-width="120px" v-loading="loading">
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item :label="$t('goods.name')" prop="name">
						<el-input v-model="state.ruleForm.name" clearable :placeholder="$t('goods.inputNameTip')"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="$t('goods.classId')" prop="classId">
						<el-select v-model="state.ruleForm.classId" clearable :placeholder="$t('goods.inputClassIdTip')" style="width: 100%">
							<el-option :key="index" :label="item.label" :value="item.value" v-for="(item, index) in goods_category"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item :label="$t('goods.price')" prop="price">
						<el-input-number
							v-model="state.ruleForm.price"
							:min="0"
							:precision="2"
							controls-position="right"
							style="width: 100%"
							:placeholder="$t('goods.inputPriceTip')"
						></el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="$t('goods.quantity')" prop="quantity">
						<el-input-number
							v-model="state.ruleForm.quantity"
							:min="0"
							controls-position="right"
							style="width: 100%"
							:placeholder="$t('goods.inputQuantityTip')"
						></el-input-number>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item :label="$t('goods.cover')" prop="cover">
				<el-input v-model="state.ruleForm.cover" clearable :placeholder="$t('goods.inputCoverTip')"></el-input>
				<div v-if="state.ruleForm.cover" style="margin-top: 10px">
					<el-image
						:src="state.ruleForm.cover"
						style="width: 200px; height: 200px; border-radius: 4px"
						fit="cover"
						:preview-src-list="[state.ruleForm.cover]"
						preview-teleported
					>
						<template #error>
							<div class="image-slot">
								<el-icon><Picture /></el-icon>
							</div>
						</template>
					</el-image>
				</div>
			</el-form-item>
			<el-form-item :label="$t('goods.detail')" prop="detail">
				<el-input
					v-model="state.ruleForm.detail"
					type="textarea"
					:rows="4"
					clearable
					:placeholder="$t('goods.inputDetailTip')"
				></el-input>
			</el-form-item>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item :label="$t('goods.saleTime')" prop="saleTime" required>
						<el-date-picker
							v-model="state.ruleForm.saleTime"
							type="datetime"
							value-format="YYYY-MM-DD HH:mm:ss"
							placeholder="请选择商品发售时间"
							style="width: 100%"
							@change="handleSaleTimeChange"
						></el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="$t('goods.endTime')" prop="endTime">
						<el-date-picker
							v-model="state.ruleForm.endTime"
							type="datetime"
							value-format="YYYY-MM-DD HH:mm:ss"
							placeholder="请选择商品结束时间"
							style="width: 100%"
						></el-date-picker>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item :label="$t('goods.canBook')" prop="canBook">
				<el-radio-group v-model="state.ruleForm.canBook">
					<el-radio :label="1">是</el-radio>
					<el-radio :label="0">否</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-row :gutter="20" v-if="state.ruleForm.canBook === 1">
				<el-col :span="12">
					<el-form-item :label="$t('goods.bookStartTime')" prop="bookStartTime">
						<el-date-picker
							v-model="state.ruleForm.bookStartTime"
							type="datetime"
							value-format="YYYY-MM-DD HH:mm:ss"
							placeholder="请选择预约开始时间"
							style="width: 100%"
						></el-date-picker>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item :label="$t('goods.bookEndTime')" prop="bookEndTime">
						<el-date-picker
							v-model="state.ruleForm.bookEndTime"
							type="datetime"
							value-format="YYYY-MM-DD HH:mm:ss"
							placeholder="请选择预约结束时间"
							style="width: 100%"
						></el-date-picker>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button type="primary" @click="onSubmit" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="goodsDialog">
import { useI18n } from 'vue-i18n';
import { info, putObj, addObj } from '/@/api/seckill/goods';
import { useMessage } from '/@/hooks/message';
import { useDict } from '/@/hooks/dict';
import { rule } from '/@/utils/validate';
import { Picture } from '@element-plus/icons-vue';
import defaultCover from '/@/assets/images/image.png';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);
const { t } = useI18n();

// 定义字典
const { goods_category } = useDict('goods_category');

// 定义变量内容
const visible = ref(false);
const loading = ref(false);
const goodsDialogFormRef = ref();

// 定义需要的数据
const state = reactive({
	ruleForm: {
		id: '',
		name: '',
		cover: '',
		classId: '',
		price: 0,
		quantity: 0,
		detail: '',
		saleableInventory: 0,
		occupiedInventory: 0,
		frozenInventory: 0,
		saleTime: '',
		syncChainTime: '',
		bookStartTime: '',
		bookEndTime: '',
		endTime: '',
		canBook: 0,
		creatorId: '',
		version: 0,
	},
});

// 验证预约开始时间
const validateBookStartTime = (rule: any, value: any, callback: any) => {
	if (state.ruleForm.canBook === 1) {
		if (!value) {
			callback(new Error('预约开始时间不能为空'));
			return;
		}
		if (state.ruleForm.saleTime && new Date(value) >= new Date(state.ruleForm.saleTime)) {
			callback(new Error('预约开始时间必须小于商品发售时间'));
			return;
		}
		if (state.ruleForm.bookEndTime && new Date(value) >= new Date(state.ruleForm.bookEndTime)) {
			callback(new Error('预约开始时间必须小于预约结束时间'));
			return;
		}
	}
	callback();
};

// 验证预约结束时间
const validateBookEndTime = (rule: any, value: any, callback: any) => {
	if (state.ruleForm.canBook === 1) {
		if (!value) {
			callback(new Error('预约结束时间不能为空'));
			return;
		}
		if (state.ruleForm.saleTime && new Date(value) >= new Date(state.ruleForm.saleTime)) {
			callback(new Error('预约结束时间必须小于商品发售时间'));
			return;
		}
		if (state.ruleForm.bookStartTime && new Date(value) <= new Date(state.ruleForm.bookStartTime)) {
			callback(new Error('预约结束时间必须大于预约开始时间'));
			return;
		}
	}
	callback();
};

// 验证商品发售时间
const validateSaleTime = (rule: any, value: any, callback: any) => {
	if (!value) {
		callback(new Error('商品发售时间不能为空'));
		return;
	}
	const saleTime = new Date(value);
	const now = new Date();
	if (saleTime <= now) {
		callback(new Error('商品发售时间必须大于当前时间'));
		return;
	}
	callback();
};

// 表单校验规则
const dataRules = reactive({
	name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
	price: [
		{ required: true, message: '价格不能为空', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value !== null && value !== undefined) {
					if (value <= 0) {
						callback(new Error('价格必须大于0'));
						return;
					}
				}
				callback();
			},
			trigger: 'blur',
		},
	],
	quantity: [
		{ required: true, message: '商品数量不能为空', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value !== null && value !== undefined) {
					if (value <= 0) {
						callback(new Error('商品数量必须大于0'));
						return;
					}
				}
				callback();
			},
			trigger: 'blur',
		},
	],
	saleTime: [
		{
			validator: validateSaleTime,
			trigger: 'blur',
		},
	],
	bookStartTime: [
		{
			validator: validateBookStartTime,
			trigger: 'blur',
		},
	],
	bookEndTime: [
		{
			validator: validateBookEndTime,
			trigger: 'blur',
		},
	],
});

// 发售时间改变时，重新验证预约时间
const handleSaleTimeChange = () => {
	if (state.ruleForm.canBook === 1) {
		nextTick(() => {
			goodsDialogFormRef.value?.validateField('bookStartTime');
			goodsDialogFormRef.value?.validateField('bookEndTime');
		});
	}
};

// 打开弹窗
const openDialog = async (type: string, row?: any) => {
	state.ruleForm.id = '';
	visible.value = true;

	await nextTick();

	goodsDialogFormRef.value?.resetFields();

	if (row?.id && type === 'edit') {
		state.ruleForm.id = row.id;
		// 获取当前商品信息
		await getGoodsDetail(row.id);
	} else {
		// 新增时设置默认封面（确保是字符串地址）
		state.ruleForm.cover = typeof defaultCover === 'string' ? defaultCover : defaultCover.toString();
	}
};

// 获取商品详情
const getGoodsDetail = (id: string | number) => {
	info(id).then((res) => {
		Object.assign(state.ruleForm, res.data);
	});
};

// 保存数据
const onSubmit = async () => {
	const valid = await goodsDialogFormRef.value.validate().catch(() => {});
	if (!valid) return false;

	try {
		loading.value = true;
		// 确保 cover 是字符串地址
		const submitData = {
			...state.ruleForm,
			cover: typeof state.ruleForm.cover === 'string' ? state.ruleForm.cover : String(state.ruleForm.cover || ''),
		};
		state.ruleForm.id ? await putObj(submitData) : await addObj(submitData);
		useMessage().success(t(state.ruleForm.id ? 'common.editSuccessText' : 'common.addSuccessText'));
		visible.value = false;
		emit('refresh');
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 暴露变量 只有暴露出来的变量 父组件才能使用
defineExpose({
	openDialog,
});
</script>
