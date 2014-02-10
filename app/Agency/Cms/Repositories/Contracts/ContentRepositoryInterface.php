<?php namespace Agency\Cms\Repositories\Contracts;

interface ContentsRepositoryInterface {

	public function create($title,$url,$parent_id);

	public function update($id,$title);

	public function set($content);

}