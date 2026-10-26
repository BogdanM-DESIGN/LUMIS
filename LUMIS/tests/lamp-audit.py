"""Two independent audit regressions. Requires the lamp generator dependencies and Pillow.
Run: python tests/lamp-audit.py
"""
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image
from shapely.geometry import box

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'lampa'))
import geom
import litofanie
import overhang

class AuditTests(unittest.TestCase):
 def test_exif_orientation_before_automatic_layout(self):
  with tempfile.TemporaryDirectory() as temp:
   file=Path(temp)/'synthetic.jpg'
   image=Image.new('RGB',(160,80),(50,120,180));exif=Image.Exif();exif[274]=6
   image.save(file,exif=exif)
   with patch.object(geom,'shade_body',return_value='body'),patch.object(geom,'collar',return_value='collar'),patch.object(geom,'union',return_value='mesh'):
    mesh,mode=litofanie.make(file)
   self.assertEqual(mode,'twice')
   self.assertEqual(mesh,'mesh')

 def test_flat_cantilever_is_not_automatically_support_free(self):
  post=geom.revolve(box(0,0,5,40))
  disk=geom.revolve(box(0,40,45,42))
  piece=geom.union(post,disk)
  steep,_,bridge,_=overhang.unsupported(piece)
  self.assertAlmostEqual(steep,0)
  self.assertGreater(bridge,6000)
  self.assertTrue(overhang.needs_bridge_review(piece))

if __name__=='__main__':unittest.main()
