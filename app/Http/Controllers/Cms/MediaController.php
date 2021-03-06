<?php namespace Agency\Http\Controllers\Cms;

use Agency\Media\Photos\Contracts\StoreInterface;

use Input, Response,File;

use Agency\Http\Controllers\Cms\Controller;

class MediaController extends Controller {

    public function __construct(StoreInterface $temp)
    {
        $this->temp = $temp;
    }

    public function store()
    {
        $input = Input::all();
        $images = $input["images"];
        $tempImages = [];
        foreach ($images as $key => $image) {
           array_push($tempImages, $this->temp->put($image));
        }

        return json_encode($tempImages);
    }

    /**
     * delete temporary image from the disk
     * @return boolean
     */
    public function destroy()
    {
        try {
            $result = File::delete(public_path()."/tmp/".Input::get('image'));

            return Response::json(["result"=>$result]);
        } catch (Exception $e) {

            return Response::json(['message'=>$e->getMessage()]);
        }
    }
}
