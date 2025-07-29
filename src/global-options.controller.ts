import { Controller, Options, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('*')
export class GlobalOptionsController {
  @ApiExcludeEndpoint()
  @Options()
  handleGlobalOptions(@Req() req: Request, @Res() res: Response) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
  }
}
