<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<el-row shadow="hover" v-show="showSearch" class="ml10">
				<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
					<el-form-item :label="$t('goods.name')" prop="name">
						<el-input
							:placeholder="$t('goods.inputNameTip')"
							clearable
							style="max-width: 180px"
							v-model="state.queryForm.name"
						/>
					</el-form-item>
					<el-form-item :label="$t('goods.state')" prop="state">
							<el-select
								v-model="state.queryForm.state"
								clearable
								:placeholder="$t('goods.inputStateTip')"
								style="max-width: 180px"
							>
								<el-option label="上架" value="ON_SALE"></el-option>
								<el-option label="下架" value="OFF_SALE"></el-option>
								<el-option label="待审核" value="PENDING"></el-option>
								<el-option label="驳回" value="REJECTED"></el-option>
							</el-select>
					</el-form-item>
					<el-form-item :label="$t('goods.canBook')" prop="canBook">
						<el-select v-model="state.queryForm.canBook" clearable style="max-width: 180px">
							<el-option :label="'是'" :value="1"></el-option>
							<el-option :label="'否'" :value="0"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button @click="query" class="ml10" icon="search" type="primary">
							{{ $t('common.queryBtn') }}
						</el-button>
						<el-button @click="resetQuery" icon="Refresh">{{ $t('common.resetBtn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>
			<el-row>
				<div class="mb8" style="width: 100%">
					<el-button @click="onOpenAddGoods" class="ml10" icon="folder-add" type="primary">
						{{ $t('common.addBtn') }}
					</el-button>
					<right-toolbar
						v-model:showSearch="showSearch"
						class="ml10"
						style="float: right; margin-right: 20px"
						@queryTable="getDataList"
					></right-toolbar>
				</div>
			</el-row>
			<el-table
				ref="tableRef"
				:data="state.dataList"
				style="width: 100%"
				v-loading="state.loading"
				border
				:cell-style="tableStyle.cellStyle"
				:header-cell-style="tableStyle?.headerCellStyle"
			>
				<el-table-column type="index" label="#" width="60" />
				<el-table-column :label="$t('goods.name')" prop="name" show-overflow-tooltip min-width="150"></el-table-column>
				<el-table-column :label="$t('goods.cover')" prop="cover" width="100">
					<template #default="scope">
						<el-image
							v-if="scope.row.cover"
							:src="scope.row.cover"
							style="width: 60px; height: 60px"
							fit="cover"
							:preview-src-list="[scope.row.cover]"
							preview-teleported
						></el-image>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column :label="$t('goods.classId')" prop="classId" show-overflow-tooltip width="120">
					<template #default="scope">
						<span v-if="scope.row.classId">
							{{ getClassIdLabel(scope.row.classId) || scope.row.classId }}
						</span>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column :label="$t('goods.price')" prop="price" width="100">
					<template #default="scope">
						<span>¥{{ scope.row.price?.toFixed(2) || '0.00' }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="$t('goods.quantity')" prop="quantity" width="100"></el-table-column>
				<el-table-column :label="$t('goods.saleableInventory')" prop="saleableInventory" width="120"></el-table-column>
				<el-table-column :label="$t('goods.state')" prop="state" width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.state === 'ON_SALE'" type="success">上架</el-tag>
						<el-tag v-else-if="scope.row.state === 'OFF_SALE'" type="info">下架</el-tag>
						<el-tag v-else-if="scope.row.state === 'PENDING'" type="warning">待审核</el-tag>
						<el-tag v-else-if="scope.row.state === 'REJECTED'" type="danger">驳回</el-tag>
						<span v-else>{{ scope.row.state }}</span>
					</template>
				</el-table-column>
				<el-table-column :label="$t('goods.canBook')" prop="canBook" width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.canBook === 1" type="success">是</el-tag>
						<el-tag v-else type="info">否</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="$t('goods.saleTime')" prop="saleTime" width="160" show-overflow-tooltip></el-table-column>
				<el-table-column :label="$t('common.action')" show-overflow-tooltip width="200" fixed="right">
					<template #default="scope">
						<!-- 待审核状态：只显示审核按钮 -->
						<template v-if="scope.row.state === 'PENDING'">
							<el-dropdown @command="(command) => handleAudit(command, scope.row)">
								<el-button text type="primary">
									待审核
									<el-icon class="el-icon--right"><arrow-down /></el-icon>
								</el-button>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item command="approve">审核通过</el-dropdown-item>
										<el-dropdown-item command="reject">驳回</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</template>
						<!-- 其他状态：显示编辑和删除按钮 -->
						<template v-else>
							<el-button
								icon="edit-pen"
								@click="onOpenEditGoods('edit', scope.row)"
								text
								type="primary"
							>
								{{ $t('common.editBtn') }}
							</el-button>
							<el-button icon="delete" @click="handleDelete(scope.row)" text type="primary">
								{{ $t('common.delBtn') }}
							</el-button>
						</template>
					</template>
				</el-table-column>
			</el-table>
			<pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
		</div>
		<GoodsDialog @refresh="getDataList()" ref="goodsDialogRef" />
	</div>
</template>

<script lang="ts" name="seckillGoods" setup>
import { delObj, pageList, approveGoods, rejectGoods } from '/@/api/seckill/goods';
import { BasicTableProps, useTable } from '/@/hooks/table';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { useDict } from '/@/hooks/dict';
import { ArrowDown } from '@element-plus/icons-vue';
// 引入组件
const GoodsDialog = defineAsyncComponent(() => import('./form.vue'));
const { t } = useI18n();

// 定义字典
const { goods_category } = useDict('goods_category');
// 定义变量内容
const tableRef = ref();
const goodsDialogRef = ref();
const queryRef = ref();
const showSearch = ref(true);
const state: BasicTableProps = reactive<BasicTableProps>({
	pageList: pageList,
	queryForm: {
		name: '',
		state: '',
		canBook: undefined,
		current: 1,
		size: 10,
	},
	isPage: true,
});

const { getDataList, currentChangeHandle, sizeChangeHandle, tableStyle } = useTable(state);

// 打开新增商品弹窗
const onOpenAddGoods = () => {
	goodsDialogRef.value.openDialog('add');
};
// 打开编辑商品弹窗
const onOpenEditGoods = (type: string, row: any) => {
	goodsDialogRef.value.openDialog(type, row);
};

// 搜索事件
const query = () => {
	state.dataList = [];
	getDataList();
};

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	state.dataList = [];
	getDataList();
};

// 根据类目ID获取字典标签
const getClassIdLabel = (classId: string) => {
	if (!classId || !goods_category.value) {
		return '';
	}
	const item = goods_category.value.find((item: any) => item.value === classId);
	return item ? item.label : '';
};

// 删除操作
const handleDelete = async (row: any) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		await delObj(row.id);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
};

// 审核操作
const handleAudit = async (command: string, row: any) => {
	try {
		if (command === 'approve') {
			await useMessageBox().confirm('确定要审核通过该商品吗？');
			await approveGoods(row.id);
			useMessage().success('审核通过成功');
		} else if (command === 'reject') {
			await useMessageBox().confirm('确定要驳回该商品吗？');
			await rejectGoods(row.id);
			useMessage().success('驳回成功');
		}
		getDataList();
	} catch (err: any) {
		if (err !== 'cancel') {
			useMessage().error(err.msg || '操作失败');
		}
	}
};
</script>

<style scoped lang="scss">
</style>
