import request from '/@/utils/request';

/**
 * 分页查询商品列表
 */
export const pageList = (params?: Object) => {
	return request({
		url: '/seckill/goods/page',
		method: 'get',
		params,
	});
};

/**
 * 查询商品列表
 */
export const list = (params?: Object) => {
	return request({
		url: '/seckill/goods/list',
		method: 'get',
		params,
	});
};

/**
 * 根据ID查询商品详情
 */
export const info = (id: string | number) => {
	return request({
		url: `/seckill/goods/${id}`,
		method: 'get',
	});
};

/**
 * 新增商品
 */
export const addObj = (data: Object) => {
	return request({
		url: '/seckill/goods',
		method: 'post',
		data,
	});
};

/**
 * 更新商品
 */
export const putObj = (data: Object) => {
	return request({
		url: '/seckill/goods',
		method: 'put',
		data,
	});
};

/**
 * 删除商品
 */
export const delObj = (id: string | number) => {
	return request({
		url: `/seckill/goods/${id}`,
		method: 'delete',
	});
};

/**
 * 批量删除商品
 */
export const delBatch = (ids: Array<string | number>) => {
	return request({
		url: '/seckill/goods/batch',
		method: 'delete',
		data: ids,
	});
};

/**
 * 审核通过商品
 */
export const approveGoods = (id: string | number) => {
	return request({
		url: `/seckill/goods/${id}/approve`,
		method: 'put',
	});
};

/**
 * 驳回商品
 */
export const rejectGoods = (id: string | number) => {
	return request({
		url: `/seckill/goods/${id}/reject`,
		method: 'put',
	});
};

/**
 * 获取防重提交token
 */
export const getToken = (scene: string, key: string | number) => {
	return request({
		url: '/seckill/goods/token/get',
		method: 'get',
		params: {
			scene,
			key,
		},
	});
};
