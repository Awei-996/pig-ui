<template>
	<div class="seckill-list-container">
		<div class="seckill-list-header">
			<h1 class="list-title">秒杀商品</h1>
			<div class="search-bar">
				<el-input
					v-model="searchKeyword"
					placeholder="搜索商品名称"
					clearable
					style="max-width: 300px"
					@keyup.enter="handleSearch"
					@clear="handleSearch"
				>
					<template #prefix>
						<el-icon><Search /></el-icon>
					</template>
				</el-input>
				<el-button type="primary" @click="handleSearch" style="margin-left: 10px">
					搜索
				</el-button>
			</div>
		</div>

		<div v-loading="loading" class="goods-grid">
			<el-empty v-if="!loading && goodsList.length === 0" description="暂无商品" />
			<el-card
				v-for="goods in goodsList"
				:key="goods.id"
				class="goods-card"
				shadow="hover"
				@click="handleCardClick(goods)"
			>
				<div class="goods-image-wrapper">
					<el-image
						:src="goods.cover || defaultCover"
						fit="cover"
						class="goods-image"
						:preview-src-list="[goods.cover || defaultCover]"
						preview-teleported
					>
						<template #error>
							<div class="image-slot">
								<el-icon><Picture /></el-icon>
							</div>
						</template>
					</el-image>
					<div v-if="goods.state === 'ON_SALE'" class="goods-badge">热卖中</div>
					<div v-if="goods.state === 'PENDING'" class="goods-badge pending">待开抢</div>
				</div>
				<div class="goods-info">
					<h3 class="goods-name" :title="goods.name">{{ goods.name }}</h3>
					<div class="goods-price">
						<span class="price-symbol">¥</span>
						<span class="price-value">{{ goods.price?.toFixed(2) || '0.00' }}</span>
					</div>
					<div class="goods-meta">
						<span class="goods-quantity">库存: {{ goods.quantity || 0 }}</span>
						<span v-if="goods.saleTime" class="goods-sale-time">
							开抢时间: {{ formatTime(goods.saleTime) }}
						</span>
					</div>
					<el-button
						:type="getButtonInfo(goods).type"
						class="goods-button"
						:disabled="getButtonInfo(goods).disabled"
						@click.stop="handleCardClick(goods)"
					>
						{{ getButtonInfo(goods).text }}
					</el-button>
				</div>
			</el-card>
		</div>

		<div v-if="total > 0" class="pagination-wrapper">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="pageSize"
				:total="total"
				:page-sizes="[12, 24, 48, 96]"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleSizeChange"
				@current-change="handlePageChange"
			/>
		</div>
	</div>
</template>

<script setup lang="ts" name="seckillList">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { pageList } from '/@/api/seckill/goods';
import { Search, Picture } from '@element-plus/icons-vue';
import defaultCover from '/@/assets/images/image.png';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const goodsList = ref<any[]>([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);

// 格式化时间
const formatTime = (time: string) => {
	if (!time) return '';
	const date = new Date(time);
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
};

// 判断是否可以抢购（售卖时间已到、活动未结束、库存大于0）
const canPurchase = (goods: any) => {
	// 判断售卖时间是否已到
	if (goods.saleTime) {
		const saleTime = new Date(goods.saleTime).getTime();
		const now = new Date().getTime();
		if (now < saleTime) {
			return false; // 还未到售卖时间
		}
	}

	// 判断活动是否已结束
	if (goods.endTime) {
		const endTime = new Date(goods.endTime).getTime();
		const now = new Date().getTime();
		if (now > endTime) {
			return false; // 活动已结束
		}
	}

	// 判断库存是否大于0
	if (!goods.quantity || goods.quantity <= 0) {
		return false; // 库存为0
	}

	return true;
};

// 获取按钮文本和状态
const getButtonInfo = (goods: any) => {
	// 如果活动已结束
	if (goods.endTime) {
		const endTime = new Date(goods.endTime).getTime();
		const now = new Date().getTime();
		if (now > endTime) {
			return { text: '活动已结束', disabled: true, type: 'info' };
		}
	}

	// 如果库存为0
	if (!goods.quantity || goods.quantity <= 0) {
		return { text: '已售罄', disabled: true, type: 'info' };
	}

	// 如果还未到售卖时间
	if (goods.saleTime) {
		const saleTime = new Date(goods.saleTime).getTime();
		const now = new Date().getTime();
		if (now < saleTime) {
			return { text: '未开抢', disabled: true, type: 'info' };
		}
	}

	// 可以抢购
	return { text: '立即抢购', disabled: false, type: 'primary' };
};

// 获取商品列表
const getGoodsList = async () => {
	try {
		loading.value = true;
		const params: any = {
			current: currentPage.value,
			size: pageSize.value,
			state: 'ON_SALE', // 只显示上架的商品
		};
		if (searchKeyword.value) {
			params.name = searchKeyword.value;
		}
		const res = await pageList(params);
		if (res.code === 0) {
			goodsList.value = res.data?.records || res.data || [];
			total.value = res.data?.total || goodsList.value.length;
		}
	} catch (error: any) {
		console.error('获取商品列表失败:', error);
	} finally {
		loading.value = false;
	}
};

// 搜索
const handleSearch = () => {
	currentPage.value = 1;
	getGoodsList();
};

// 分页大小改变
const handleSizeChange = (size: number) => {
	pageSize.value = size;
	currentPage.value = 1;
	getGoodsList();
};

// 页码改变
const handlePageChange = (page: number) => {
	currentPage.value = page;
	getGoodsList();
};

// 处理卡片点击事件
const handleCardClick = (goods: any) => {
	// 如果可以抢购，才允许进入详情
	if (!canPurchase(goods)) {
		return;
	}
	goToDetail(goods.id);
};

// 跳转到详情页
const goToDetail = (id: number) => {
	router.push({
		path: '/seckill/detail',
		query: { id },
	});
};

// 初始化
onMounted(() => {
	getGoodsList();
});
</script>

<style scoped lang="scss">
.seckill-list-container {
	padding: 20px;
	min-height: calc(100vh - 100px);
	background: var(--el-bg-color-page);

	.seckill-list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--el-border-color-light);

		.list-title {
			font-size: 28px;
			font-weight: 600;
			color: var(--el-text-color-primary);
			margin: 0;
		}

		.search-bar {
			display: flex;
			align-items: center;
		}
	}

	.goods-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
		margin-bottom: 30px;

		.goods-card {
			cursor: pointer;
			transition: all 0.3s ease;
			border-radius: 8px;
			overflow: hidden;

			&:hover {
				transform: translateY(-4px);
				box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
			}

			:deep(.el-card__body) {
				padding: 0;
			}

			.goods-image-wrapper {
				position: relative;
				width: 100%;
				height: 200px;
				overflow: hidden;
				background: var(--el-fill-color-light);

				.goods-image {
					width: 100%;
					height: 100%;
				}

				.image-slot {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: 100%;
					background: var(--el-fill-color-lighter);
					color: var(--el-text-color-placeholder);
					font-size: 30px;
				}

				.goods-badge {
					position: absolute;
					top: 10px;
					right: 10px;
					background: var(--el-color-danger);
					color: white;
					padding: 4px 12px;
					border-radius: 12px;
					font-size: 12px;
					font-weight: 500;

					&.pending {
						background: var(--el-color-warning);
					}
				}
			}

			.goods-info {
				padding: 16px;

				.goods-name {
					font-size: 16px;
					font-weight: 500;
					color: var(--el-text-color-primary);
					margin: 0 0 12px 0;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.goods-price {
					display: flex;
					align-items: baseline;
					margin-bottom: 12px;

					.price-symbol {
						font-size: 14px;
						color: var(--el-color-danger);
						font-weight: 500;
					}

					.price-value {
						font-size: 24px;
						color: var(--el-color-danger);
						font-weight: 600;
						margin-left: 2px;
					}
				}

				.goods-meta {
					display: flex;
					justify-content: space-between;
					font-size: 12px;
					color: var(--el-text-color-secondary);
					margin-bottom: 16px;

					.goods-quantity,
					.goods-sale-time {
						flex: 1;
					}
				}

				.goods-button {
					width: 100%;
				}
			}
		}
	}

	.pagination-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 30px;
	}
}

@media (max-width: 768px) {
	.seckill-list-container {
		.seckill-list-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;

			.search-bar {
				width: 100%;
			}
		}

		.goods-grid {
			grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
			gap: 12px;
		}
	}
}
</style>
