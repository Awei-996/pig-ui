<template>
	<div class="goods-detail-container" v-loading="loading">
		<el-button
			icon="ArrowLeft"
			text
			type="primary"
			@click="goBack"
			style="margin-bottom: 20px"
		>
			返回列表
		</el-button>

		<div v-if="goodsInfo" class="goods-detail-content">
			<!-- 商品图片和基本信息 -->
			<div class="goods-main">
				<div class="goods-image-section">
					<el-image
						:src="goodsInfo.cover || defaultCover"
						fit="cover"
						class="main-image"
						:preview-src-list="[goodsInfo.cover || defaultCover]"
						preview-teleported
					>
						<template #error>
							<div class="image-slot">
								<el-icon><Picture /></el-icon>
							</div>
						</template>
					</el-image>
					<div v-if="goodsInfo.state === 'ON_SALE'" class="status-badge">热卖中</div>
					<div v-else-if="goodsInfo.state === 'PENDING'" class="status-badge pending">待开抢</div>
				</div>

				<div class="goods-info-section">
					<h1 class="goods-title">{{ goodsInfo.name }}</h1>
					<div class="goods-price-section">
						<span class="price-label">秒杀价</span>
						<div class="price-content">
							<span class="price-symbol">¥</span>
							<span class="price-value">{{ goodsInfo.price?.toFixed(2) || '0.00' }}</span>
						</div>
					</div>

					<div class="goods-meta-info">
						<div class="meta-item">
							<span class="meta-label">商品类目：</span>
							<span class="meta-value">{{ getClassIdLabel(goodsInfo.classId) || goodsInfo.classId || '-' }}</span>
						</div>
						<div class="meta-item">
							<span class="meta-label">商品详情：</span>
							<span class="meta-value">{{ goodsInfo.detail || '-' }}</span>
						</div>
						<div class="meta-item">
							<span class="meta-label">库存数量：</span>
							<span class="meta-value">{{ goodsInfo.quantity || 0 }}</span>
						</div>
						<div class="meta-item">
							<span class="meta-label">可销售库存：</span>
							<span class="meta-value">{{ goodsInfo.saleableInventory || 0 }}</span>
						</div>
						<div v-if="goodsInfo.saleTime" class="meta-item">
							<span class="meta-label">开抢时间：</span>
							<span class="meta-value">{{ formatTime(goodsInfo.saleTime) }}</span>
						</div>
						<div v-if="goodsInfo.canBook === 1 && goodsInfo.bookStartTime && goodsInfo.bookEndTime" class="meta-item">
							<span class="meta-label">预约时间：</span>
							<span class="meta-value">
								{{ formatTime(goodsInfo.bookStartTime) }} 至 {{ formatTime(goodsInfo.bookEndTime) }}
							</span>
						</div>
					</div>

					<div class="goods-actions">
						<el-button
							type="primary"
							size="large"
							:disabled="goodsInfo.state !== 'ON_SALE'"
							@click="handleSeckill"
							style="width: 200px"
						>
							{{ goodsInfo.state === 'ON_SALE' ? '立即抢购' : '暂不可购买' }}
						</el-button>
						<el-button
							v-if="goodsInfo.canBook === 1"
							type="warning"
							size="large"
							:disabled="goodsInfo.state !== 'ON_SALE'"
							@click="handleBook"
							style="width: 200px"
						>
							立即预约
						</el-button>
					</div>
				</div>
			</div>

			<!-- 商品详情 -->
			<!-- <div class="goods-detail-section">
				<el-card shadow="never">
					<template #header>
						<h3>商品详情</h3>
					</template>
					<div class="detail-content" v-html="goodsInfo.detail || '暂无详情'"></div>
				</el-card>
			</div> -->
		</div>

		<el-empty v-else-if="!loading" description="商品不存在或已下架" />
	</div>
</template>

<script setup lang="ts" name="seckillDetail">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { info } from '/@/api/seckill/goods';
import { useDict } from '/@/hooks/dict';
import { useMessage } from '/@/hooks/message';
import { Picture, ArrowLeft } from '@element-plus/icons-vue';
import defaultCover from '/@/assets/images/image.png';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const goodsInfo = ref<any>(null);

// 定义字典
const { goods_category } = useDict('goods_category');

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

// 根据类目ID获取字典标签
const getClassIdLabel = (classId: string) => {
	if (!classId || !goods_category.value) {
		return '';
	}
	const item = goods_category.value.find((item: any) => item.value === classId);
	return item ? item.label : '';
};

// 获取商品详情
const getGoodsDetail = async () => {
	const id = route.query.id;
	if (!id) {
		useMessage().error('商品ID不能为空');
		router.back();
		return;
	}

	try {
		loading.value = true;
		const res = await info(id);
		if (res.code === 0 && res.data) {
			goodsInfo.value = res.data;
		} else {
			useMessage().error('获取商品详情失败');
			router.back();
		}
	} catch (error: any) {
		useMessage().error(error.msg || '获取商品详情失败');
		router.back();
	} finally {
		loading.value = false;
	}
};

// 立即抢购
const handleSeckill = () => {
	if (goodsInfo.value?.state !== 'ON_SALE') {
		useMessage().warning('商品暂不可购买');
		return;
	}
	// TODO: 实现抢购逻辑
	useMessage().success('抢购功能开发中...');
};

// 立即预约
const handleBook = () => {
	if (goodsInfo.value?.state !== 'ON_SALE') {
		useMessage().warning('商品暂不可预约');
		return;
	}
	// TODO: 实现预约逻辑
	useMessage().success('预约功能开发中...');
};

// 返回列表
const goBack = () => {
	router.push('/seckill/list');
};

// 初始化
onMounted(() => {
	getGoodsDetail();
});
</script>

<style scoped lang="scss">
.goods-detail-container {
	padding: 20px;
	min-height: calc(100vh - 100px);
	background: var(--el-bg-color-page);

	.goods-detail-content {
		.goods-main {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 30px;
			margin-bottom: 30px;

			.goods-image-section {
				position: relative;
				background: var(--el-fill-color-light);
				border-radius: 8px;
				overflow: hidden;

				.main-image {
					width: 100%;
					height: 500px;
				}

				.image-slot {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: 500px;
					background: var(--el-fill-color-lighter);
					color: var(--el-text-color-placeholder);
					font-size: 50px;
				}

				.status-badge {
					position: absolute;
					top: 20px;
					right: 20px;
					background: var(--el-color-danger);
					color: white;
					padding: 8px 16px;
					border-radius: 20px;
					font-size: 14px;
					font-weight: 500;

					&.pending {
						background: var(--el-color-warning);
					}
				}
			}

			.goods-info-section {
				.goods-title {
					font-size: 28px;
					font-weight: 600;
					color: var(--el-text-color-primary);
					margin: 0 0 24px 0;
					line-height: 1.4;
				}

				.goods-price-section {
					margin-bottom: 30px;
					padding: 20px;
					background: var(--el-color-danger-light-9);
					border-radius: 8px;
					border: 1px solid var(--el-color-danger-light-7);

					.price-label {
						display: block;
						font-size: 14px;
						color: var(--el-text-color-secondary);
						margin-bottom: 8px;
					}

					.price-content {
						display: flex;
						align-items: baseline;

						.price-symbol {
							font-size: 20px;
							color: var(--el-color-danger);
							font-weight: 500;
						}

						.price-value {
							font-size: 36px;
							color: var(--el-color-danger);
							font-weight: 700;
							margin-left: 4px;
						}
					}
				}

				.goods-meta-info {
					margin-bottom: 30px;

					.meta-item {
						display: flex;
						padding: 12px 0;
						border-bottom: 1px solid var(--el-border-color-lighter);

						&:last-child {
							border-bottom: none;
						}

						.meta-label {
							font-size: 14px;
							color: var(--el-text-color-secondary);
							min-width: 100px;
						}

						.meta-value {
							font-size: 14px;
							color: var(--el-text-color-primary);
							flex: 1;
						}
					}
				}

				.goods-actions {
					display: flex;
					gap: 16px;
				}
			}
		}

		.goods-detail-section {
			:deep(.el-card__header) {
				h3 {
					margin: 0;
					font-size: 18px;
					font-weight: 600;
				}
			}

			.detail-content {
				min-height: 200px;
				line-height: 1.8;
				color: var(--el-text-color-primary);
			}
		}
	}
}

@media (max-width: 768px) {
	.goods-detail-container {
		.goods-detail-content {
			.goods-main {
				grid-template-columns: 1fr;

				.goods-image-section {
					.main-image {
						height: 300px;
					}

					.image-slot {
						height: 300px;
					}
				}

				.goods-info-section {
					.goods-title {
						font-size: 22px;
					}

					.goods-price-section {
						.price-content {
							.price-value {
								font-size: 28px;
							}
						}
					}

					.goods-actions {
						flex-direction: column;

						.el-button {
							width: 100% !important;
						}
					}
				}
			}
		}
	}
}
</style>
